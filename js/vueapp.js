//import Vue from 'vue';
// This is the main app
export const app = {
  data() {
    return {
      eventCode: "",
      message: "",
      eventID: Number,
      sortedTeamList: [{ number: "3050X", time: 0, selected: false }],
      displayTeamList: [],
      selectedTeamList: [],
      reverse: false,
      showSelected: false,
      teamInput: "",
      currMatch: 0,
      teamList: [],
      matchList: [],
    };
  },

  methods: {
    addTeamButton: function () {
      //funciton called when add team button is clicked
      if (this.teamInput) {
        this.selectedTeamList.push(this.teamInput);
        let team = this.teamInput;
        this.teamInput = '';
        console.log(this.selectedTeamList);
        setCookie('selectedTeamList', JSON.stringify(this.selectedTeamList), 3);
        for (var i = 0; i < this.sortedTeamList.length; i++) {
          if (team.toLowerCase() === this.sortedTeamList[i].number.toLowerCase() || this.sortedTeamList[i].number.startsWith(team.toLowerCase())) {
            console.log("found team")
            this.sortedTeamList[i].selected = true;
          }
        }
        //this.updateSortedTeamList();
      }
    },
    //function called when a team is checked or unchecked
    addTeam: function (team) {
      if (team.selected == true) {
        this.selectedTeamList.push(team.number);
        console.log(this.selectedTeamList);

      } else {
        //remove team
        console.log("uncheck")
        for (var i = 0; i < this.selectedTeamList.length; i++) {
          if (team.number.toLowerCase() === this.selectedTeamList[i].toLowerCase() || this.selectedTeamList[i].startsWith(team.number.toLowerCase())) {
            this.selectedTeamList.splice(i, 1);
          }
        }
      }
      setCookie('selectedTeamList', JSON.stringify(this.selectedTeamList), 3);
    },
    removeTeam: function (index) {
      var teamNumber = this.selectedTeamList[index];
      this.selectedTeamList.splice(index, 1);
      for (var i = 0; i < this.sortedTeamList.length; i++) {
        if (teamNumber.toLowerCase() === this.sortedTeamList[i].number.toLowerCase() || this.sortedTeamList[i].number.startsWith(teamNumber.toLowerCase())) {
          this.sortedTeamList[i].selected = false;

          if (this.showSelected) {
            console.log("removing team from display list");
            var team = this.sortedTeamList[i];
            let index = this.displayTeamList.indexOf(team);
            this.displayTeamList.splice(index, 1);
          }
        }
      }
      setCookie('selectedTeamList', JSON.stringify(this.selectedTeamList), 3);

    },
    async updateAll() {
      await this.updateEventData();
      await this.updateSortedTeamList();
    },
    //function called to refresh data from RE
    async updateEventData() {
      let eventCode = this.eventCode;

      if (eventCode === "") {
        this.message = "Please enter an event code";
        return;
      }
      var eventID;
      if (getCookie("eventID") == null) {
        eventID = await this.getREDeventID(eventCode);
        setCookie("eventID", eventID, 3);
      }
      else if (getCookie("eventCode") == this.eventCode) {
        eventID = getCookie("eventID");
        console.log("getting cookie")
      } else {
        setCookie("eventCode", this.eventCode, 3);
        eventID = await this.getREDeventID(eventCode);
        setCookie("eventID", eventID, 3);
        console.log("setting cookie");
      }
      this.message = "loading...";

      // Now you have an event code
      // fetch the data from the server



      if (eventID == null) { this.message = "invalid event code"; return; }
      console.log("Event ID: " + eventID);
      console.log("Fetching data for event code: " + eventCode);
      var [teamList, matchList, currMatch] = await Promise.all([
        this.getTeamsFromEvent(eventID),
        this.getMatchesFromEvent(eventID),
        this.getCurrMatchFromEvent(eventID)
      ]);
      console.log("Team List: " + teamList + "eeee");
      this.currMatch = currMatch;
      for (let i = 0; i < teamList.length; i++) {

        teamList[i] = { number: teamList[i], time: 0, selected: false };
        if (this.sortedTeamList != null && this.sortedTeamList.length > 0) {
          //loop through sortedTeamList to se see if the current team from teamList exists
          for (let j = 0; j < teamList.length; j++) {
            if (teamList[i].number.toLowerCase() == this.sortedTeamList[j].number.toLowerCase()) {
              teamList[i].selected = this.sortedTeamList[j].selected;
              break;
            }
          }
        }
      }
      this.matchList = matchList;
      this.sortedTeamList = teamList;
      if (teamList == null) {
        this.message = "invalid event code";
        return;
      }
      if (matchList == null) {
        this.message = "Match schedule not released yet"
        this.matchList = [
          ["1234A", "1234B", "1234C", "1234D"],
          ["1234E", "1234F", "1234G", "1234H"],
        ];
        this.currMatch = 0;
        // for(var i = 0; i < teamList.length; i++){
        //   this.sortedTeamList[i] = {number:teamList[i].number, time: 0, selected: false};
        // }
        return;
      }
      this.message = "Data loaded ";
      //currMatch = 5;
      // sort it
      //console.log("Sorting data for event code: " + eventCode);
      //console.log("Match List: " + matchList);
      //console.log("Team List: " + teamList);
      //console.log("Current Match: " + currMatch);
      this.message = "Current Match: " + currMatch;
    },

    //function called to update the sorted team list
    async updateSortedTeamList() {

      //console.log("updateSortedTeamList: " + this.sortedTeamList);
      // if(this.showSelected==false){
      //   await this.updateEventData();
      // }
      console.log(this.matchList)
      var sortedList = this.generateSortedList(this.matchList, this.sortedTeamList, this.currMatch);
      console.log("finished generation")
      console.log(this.sortedTeamList.length)
      for (let i = 0; i < this.sortedTeamList.length; i++) {

        if (this.sortedTeamList[i].selected) {
          console.log("selected team detected")
          var index = -1;
          for (let j = 0; j < sortedList.length; j++) {
            if (sortedList[j].number == this.sortedTeamList[i].number) {
              index = j;
              break;
            }
          }
          if (index != -1) {
            sortedList[i].selected = true;
          }
        }
      }
      /*
      auohaepnaofiauebuopabv ipeip359 2125, 2151;
       {} eflaa faep acaemf;h83 2 35325
      */
      for(let i =0;i<this.selectedTeamList.length;i++){
        for (let j = 0; j < sortedList.length; j++) {
          let teamNum = this.selectedTeamList[i];
          console.log("teamnum" + teamNum)
          if (teamNum == sortedList[j].number || sortedList[j].number.startsWith(teamNum) ) {
            console.log("found it")
            sortedList[j].selected = true
          }
        }
      }
      // and fill this array
      if (this.reverse) {
        sortedList = sortedList.reverse();
      }
      //console.log(this.showSelected)
      this.sortedTeamList = sortedList;
      if (this.selectedTeamList.length > 0 && this.showSelected) {
        sortedList = sortedList.filter(team => team.selected === true);
      }
      this.displayTeamList = sortedList;
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
      if (eventcode["data"][0] == null) {
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
      if (matchesData.length == 0 || matchesData == null) {
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
        if (match["started"] == null && matchesData[i + 1]["started"] == null) {
          break;
        }
      }
      return i;
    },
    generateSortedList: function (
      matchList,
      teamlist,
      inital,
    ) {
      //console.log("generateSortedListz; " + teamlist);
      var teams = this.generateList(
        matchList,
        teamlist,
        inital
      );

      //console.log("generateSortedList: " + teams);
      // Sort the indices based on corresponding values in output in descending order
      teams.sort(function (a, b) {
        return b.time - a.time;
      });

      return teams;
    },
    generateList: function (matchList, teamlist, inital) {
      //console.log("generateList");
      var teams = teamlist;
      //console.log("generateList: " + teamlist);
      for (var i = 0; teams[i] != null; i++) {
        //console.log("generateTime: " + teams[i]);
        if (teams[i] == null) {
          break;
        }
        let val = this.findRowNumber(teams[i].number, matchList, inital);
        //console.log(val)
        teams[i].time = val - inital + 1;
      }
      return teams;
    },
    findRowNumber: function (
      searchString,
      matchList,
      inital
    ) {
      //console.log("findColumnNumber: " + searchString);
      var i = inital - 1;
      //console.log(this.matchList);
      //console.log("findColumnNumber: " + this.matchList.length);
      i = Math.max(1, i);
      console.log(matchList)
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
    updateFunction: function () {
      console.log("updateFunction");
      let eventCode = this.eventCode;
      if (eventCode === "") {
        return;
      }
      if (!eventCode.startsWith("RE-")) {
        return;
      }
      this.updateSortedTeamList();
      console.log("e");

    },
    reverseTeamList: function () {
      this.displayTeamList = this.displayTeamList.reverse();
    }
  },
  mounted() {
    this.sortedTeamList = { number: "3050X", time: 0, selected: false };
    const searchParams = new URLSearchParams(window.location.search);
    console.log("mounted");
    this.interval = setInterval(() => this.updateFunction(), 60000);
    if (searchParams.has("e")) {
      console.log("Event code found in URL");
      this.eventCode = searchParams.get("e");
      this.updateAll();

      setCookie("eventCode", this.eventCode, 3);

    } else {
      console.log("Event code not found in URL");
      this.eventCode = getCookie("eventCode");
      if (this.eventCode != "") {
        this.updateAll();
      }
    }
    let cookieValue = getCookie('selectedTeamList');
    if (cookieValue) {
      this.selectedTeamList = JSON.parse(cookieValue);
    }
  },
  beforeDestroy() {
    clearInterval(this.interval);
  }


};

function setCookie(cname, cvalue, exdays) {
  console.log("Setting cookie")
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  console.log("Getting cookie")
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
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
