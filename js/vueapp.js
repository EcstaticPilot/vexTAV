//import Vue from 'vue';
// This is the main app
export const app = {
  data() {
    return {
      eventCode: "",
      message: "",
      sortedTeamList: [],
    };
  },

  methods: {
    async updateSortedTeamList() {
      
      let eventCode = this.eventCode;
      if (eventCode === "") {
        this.message = "Please enter an event code";
        return;
      }
      setCookie("eventCode", this.eventCode, 3);
      this.message = "loading...";

      // Now you have an event code
      // fetch the data from the server
      if(!eventCode.startsWith("RE-VRC-")){
        this.message = "invalid event code";
        return;
      }
      var eventID = await this.getREDeventID(eventCode);
      if(eventID == null){
        this.message = "invalid event code";
        return;
      }
      console.log("Event ID: " + eventID);
      console.log("Fetching data for event code: " + eventCode);
      var [teamList, matchList, currMatch] = await Promise.all([
        this.getTeamsFromEvent(eventID),
        this.getMatchesFromEvent(eventID),
        this.getCurrMatchFromEvent(eventID)
      ]);
      
      if(teamList == null){
        this.message = "invalid event code";
        return;
      }
      if(matchList == null){
        this.message = "Match schedule not released yet"
        return;
      }
      this.message = "Data loaded ";
      //currMatch = 5;
      // sort it
      console.log("Sorting data for event code: " + eventCode);
      console.log("Match List: " + matchList);
      console.log("Team List: " + teamList);
      console.log("Current Match: " + currMatch);
      this.message = "Current Match: " + currMatch;
      var sortedList = this.generateSortedList(
        matchList,
        teamList,
        currMatch
      );
      // and fill this array
      
      console.log("Sorted List: " + sortedList);
      this.sortedTeamList = sortedList;
      
    },
    async getREData(url) {
      var headers = {
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMTA2YjI3NTU0MzA4YWE3ZTlkMGNiNTVjZjRmYmZkODI5YzUwODE4ZjgwZGZiYjI2YjY3YzU0NjFjMWE3MWE1ZmE5MTJhYWU0OWNjMTAzYzUiLCJpYXQiOjE3MDY0ODA4NTYuNjI4NzM3OSwibmJmIjoxNzA2NDgwODU2LjYyODc0MSwiZXhwIjoyNjUzMjUyMDU2LjYyMTk3NjksInN1YiI6IjExNTM1NyIsInNjb3BlcyI6W119.boMI9vn5YPbrTOQP8VjpTBJInO7TGm8X4VUYVt-nBi2KOarPHqCkNCvsSMb_8yAHyikMWxaRqoEFsLuXZdmjilyTeMfzXAzBnKTvQB4lzx6gCOfYtiQzJk8LkcZglk-bpoiLYxyJ6Jhk-WEvAy5hD0beu9vw_WCaUfLsVjdjTDmdppLSucrw_m_ICZGnNe-OscU1tIXttveogUQ_TOtLYOLXC0I15Qrv_II_LQ9RAbXrUiqbxXbP0lAAsh86yaYnoK-Vv62V7YoMIqxWwNSJ9YuyffbG7X3Cq2s9yvpKmdU8FsSppM96Nm_wwzzFy6rdC8bUDomyPz1sga35iUZcJrmvHAwN7SgSfKo9gJuJ8mFWEbIsr8869GmcVKcvcmDsdOkPZ3jKoTXPvmVMCots6qEl0zMZ3xChACxU87YR6ZKQFeKcz_kMs98AwpSLuBg3fimT_ltOTS4Xwgro58cgko-Bgklenv1MZz3-eIu-h4eRPxN_xdoTuAFClVE2LyLUFD18CX_fJemNj1-kVCyFXjXF00z8PE7W7_kSx8zxwYT_Vou3h0J8i-d3kjA9jme7tgSm5A8Ef0oppcQ5Mw5VeiUz2yw_6Ka7wUFljMrgBlZB0fZ8Il2hdkMxtm29KDP0HzlzqYEwViWNC1NnxadMjnF0yxHt-68B7eojnDbGSsA",
        },
      };
      var response = await fetch(url, headers);
      var data = await response.json();
      return data;
    },
    async getREDeventID(reCode) {
      var eventcode = await this.getREData(
        "https://www.robotevents.com/api/v2/events?sku%5B%5D=" +
        reCode +
        "&myEvents=false"
      );
      if(eventcode["data"][0] == null){
        return null;
      }
      eventcode = parseInt(eventcode["data"][0]["id"]);
      return eventcode;
    },
    async getTeamsFromEvent(eventID) {
      //  Get the teams from the event.
      var eventTeams = await this.getREData(
        "https://www.robotevents.com/api/v2/events/" +
        eventID +
        "/teams?myTeams=false&per_page=250"
      );
      eventTeams = eventTeams["data"];
      var teamList = [];
      //  Iterate through the list to get just the teams.
      for (var i = 0; i < eventTeams.length; i++) {
        teamList[i] = eventTeams[i]["number"];
      }
      return teamList;
    },
    async getMatchesFromEvent(eventID) {
      //  Turn the code into an event ID.
      
      //  Get the teams from the event.

      var eventTeams = await this.getREData(
        "https://www.robotevents.com/api/v2/events/" +
        eventID +
        "/divisions/1/matches?per_page=250"
      );
      var matchesData = eventTeams["data"];

      var matchList = [];
      if(matchesData.length == 0 || matchesData == null){
        return null;
      }
      console.log("Matches Data: " + matchesData);
      console.log("Matches Data Length: " + matchesData.length);
      for (var i = 0; i < matchesData.length; i++) {
        var match = matchesData[i];

        // Check if 'alliances' property exists
        if ("alliances" in match) {
          var alliances = match["alliances"];

          // Extracting team names from each alliance
          var ra = alliances[0]["teams"];
          var ba = alliances[1]["teams"];

          // Creating an array for the current match
          matchList[i] = [
            ba[0]["team"]["name"],
            ba[1]["team"]["name"],
            ra[0]["team"]["name"],
            ra[1]["team"]["name"],
          ];
        } else {
          console.error(
            "Error: 'alliances' property not found in the match data."
          );
          // Handle the error as needed
        }
      }

      return matchList;
    },
    async getCurrMatchFromEvent(eventID) {
      //  Turn the code into an event ID
      var eventTeams = await this.getREData(
        "https://www.robotevents.com/api/v2/events/" +
        eventID +
        "/divisions/1/matches?per_page=250"
      );
      var matchesData = eventTeams["data"];
      for (var i = 0; i < matchesData.length; i++) {
        var match = matchesData[i];
        // Creating an array for the current match
        if (match["started"] == null && matchesData[i+1]["started"] == null) {
          break;
        }
      }
      return i;
    },
    generateSortedList: function (
      matchList,
      teamlist,
      inital
    ) {
      console.log("generateSortedList");
      var output = this.generateList(
        matchList,
        teamlist,
        inital
      );

      var indices = Array.from(output.keys());

      // Sort the indices based on corresponding values in output in descending order
      indices.sort(function (a, b) {
        return output[b] - output[a];
      });

      // Map the sorted indices to corresponding teams in teamlist
      var finalOutput = indices.map(function (index) {
        return [teamlist[index], output[index]];
      });

      return finalOutput;
    },
    generateList: function (matchList, teamlist, inital) {
      console.log("generateList");
      var teams = teamlist;
      var output = [];
      for (var i = 0; teams[i] != null; i++) {
        console.log("generateList: " + teams[i]);
        if (teams[i] == null) {
          break;
        }
        let val = this.findRowNumber(teams[i], matchList, inital);
        output.push(val - inital + 1);
      }
      return output;
    },
    findRowNumber: function (
      searchString,
      matchList,
      inital
    ) {
      console.log("findColumnNumber" + searchString);
      var i = inital - 1;
      for (i; i < matchList.length; i++) {
        console.log("findColumnNumber: " + matchList[i]);
        if (
          matchList[i][0] == searchString ||
          matchList[i][1] == searchString ||
          matchList[i][2] == searchString ||
          matchList[i][3] == searchString
        ) {
          break;
        }
      }
      return i;
    },
    updateFunction : function(){
      console.log("updateFunction");
      let eventCode = this.eventCode;
      if(eventCode === ""){
        return;
      }
      if(!eventCode.startsWith("RE-VRC-")){
        return;
      }
      if(eventCode.length != 14){
        return;
      }
      this.updateSortedTeamList();
      console.log("e");
      
    },
  },
  mounted() {
    const searchParams = new URLSearchParams(window.location.search);
    console.log("mounted");
    this.interval = setInterval(() => this.updateFunction(), 60000);
    if (searchParams.has("e")) {
      console.log("Event code found in URL");
      this.eventCode = searchParams.get("e");
      this.updateSortedTeamList();
      setCookie("eventCode", this.eventCode, 3);
    }else{
      console.log("Event code not found in URL");
      this.eventCode = getCookie("eventCode");
      if(this.eventCode != ""){
        this.updateSortedTeamList();
      }
    }
    
  },
  beforeDestroy(){
    clearInterval(this.interval);
  }


};

function setCookie(cname, cvalue, exdays) {
  console.log("Setting cookie")
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  console.log("Getting cookie")
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
Vue.createApp(app).mount("#app");
