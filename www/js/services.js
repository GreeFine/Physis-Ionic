angular.module('starter.services', ['ionic','firebase'])

  .factory('sFirebase', function ($location) {
    var fncError = function(error) {
      console.log(error.code + " : " + error.message)
    }
    Database = firebase.database();
    Time = new Date();
    TimeFirst =  Time.getDate() - Time.getDay();//First Day of the week
    var data = { firebase: { uid: false, register: false, ready: false }, profilePic: false, track: false, user: false, group: false, coach: false };
    var callback = { tracking: false, progress: false, coach : false};
    var userRequest = (function() {
      if (data.firebase.register === true)
      {
        Database.ref('users/' + data.firebase.uid).set({
          name: data.user.name,
          email: data.user.email,
          age: data.user.age,
          bio: data.user.bio,
          gid: "false"
        });
        var profileRef = firebase.storage().ref().child('profile_pic/' + data.firebase.uid);
        profileRef.put(data.user.profilePic).then(function (snapshot) {
        }).catch(function (error) {
          console.log(error.code + " : " + error.message);
          alert(error.message);
        });
      }
      Database.ref('/users/' + data.firebase.uid).once('value').then(function(snapshot) {
        data.user = {
          name: snapshot.val().name,
          email: snapshot.val().email,
          age: snapshot.val().age,
          bio: snapshot.val().bio,
          FWeight: snapshot.val().FWeight,
          programStart: snapshot.val().programStart,
          gid: snapshot.val().gid,
          healthy: snapshot.val().healthy
        }
        data.user.ready = true;
        if (data.group === false)
          groupRequest();
        firebase.storage().ref('profile_pic/' + data.firebase.uid).getDownloadURL().then(function(url) {
          data.user.profilePic = url // Insert url into an <img> tag to "download"
          data.profilePic = { ready: true }
          }).catch(function(error) {
            console.log(error.code + " : " + error.message)
          });
      }).catch(function (error) {
        console.log(error.code + " : " + error.message)
      })
    });

    var trackRequest = (function() {
      data.track = {
        days: {},
        weekWeighings: [],
        // streak: 0,  //Unused
        // lWeight: 0, //Unused
        weekSports: [],
        weekSportsTime: 0,
        weekSportsPlan: [],
      }

      data.track.weekWeighings = [];
      var fnc = function(snapshot) {
        data.track.days[snapshot.getKey()] = snapshot.val();
        // data.track.streak = 0; //Unused
        // data.track.lWeight = 0; //Unused
        data.track.weekSports = [];
        data.track.weekSportsTime = 0;
        data.track.weekSportsPlan = [];
        data.track.weeksSports = {};
        var lastWeekFirst = false;
        var lastWeek = false;

        for (var day in data.track.days)
        {
          var frDate = day.split("-");
          var elemDate = new Date(frDate[0], frDate[1]-1, frDate[2]);
          var snapshotChild = data.track.days[day];
          // if (snapshotChild.weight !== undefined)
          //   data.track.lWeight = snapshotChild.weight;

          // Current Week tracking
          if (elemDate.getMonth() === Time.getMonth() &&
              elemDate.getDate() >= TimeFirst && elemDate.getDate() <= TimeFirst + 6)
          {
            if (snapshotChild.sportDay !== undefined)
            {
              data.track.weekSportsTime += Number(snapshotChild.sportDay[1]);
              data.track.weekSports.push(snapshotChild.sportDay);
            };
            if (snapshotChild.weekSportsPlan !== undefined)
            {
              data.track.weekSportsPlanTime = 0;
              data.track.weekSportsPlan = snapshotChild.weekSportsPlan;
              for (var index in snapshotChild.weekSportsPlan)
                data.track.weekSportsPlanTime += Number(snapshotChild.weekSportsPlan[index][2]);
            }
          }

          // Weeks tracking
          if (lastWeek === false || elemDate.getMonth() !== lastWeek.getMonth() ||
              elemDate.getDate() <= lastWeekFirstD || elemDate.getDate() >= lastWeekFirstD + 6)
          {
            var elemDate_varName = elemDate.getMonth() + "-" + elemDate.getDate();
            lastWeek = elemDate;
            lastWeekFirstD = lastWeek.getDate() - lastWeek.getDay();
            //TODO got -1 in lastWeekFirst rebuild week data system
            if (snapshotChild.weight !== undefined)
              data.track.weekWeighings[elemDate_varName] = Number(snapshotChild.weight);
            if (data.track.weeksSports[elemDate_varName] === undefined)
              data.track.weeksSports[elemDate_varName] = 0;
            if (snapshotChild.sportDay !== undefined)
              data.track.weeksSports[elemDate_varName] += Number(snapshotChild.sportDay[1]);
          };
        };

        // var timeDiff = Math.abs(Time.getTime() - elemDate.getTime());
        // data.track.streak = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1;
        if (callback.progress !== false)
          callback.progress();
        if (callback.tracking !== false)
          callback.tracking();
      };

      var refTracking = Database.ref('/users/' + data.firebase.uid + '/track/');
      refTracking.off();
      refTracking.orderByKey().on('child_added', fnc);
      refTracking.orderByKey().on('child_changed', fnc);
      data.track.ready = true;
   })

    var groupRequest = (function() {
      data.group = {
        uids: [],
        names: [],
        profilePics: [],
        conversation: []
      }
      var refConversation = Database.ref('groups/' + data.user.gid + '/messages/').limitToLast(40)
      var fncConversation = function(snapshot) {
        var index = data.group.conversation.push(snapshot.val()) - 1
        if (data.group.conversation[index].name === data.user.name)
        {
          data.group.conversation[index].style = "right"
          data.group.conversation[index].color = "calm"
        }
        else
          data.group.conversation[index].color = "assertive"
      }
      refConversation.orderByKey().on('child_added', fncConversation);
      refConversation.orderByKey().on('child_changed', fncConversation);
      if (data.user.gid === false) {
        Database.ref('/groups/' + data.user.gid).once('value').then(function (snapshot) {
          data.group.uids = snapshot.val().uids;
          data.group.coach = snapshot.val().coach;
          coachRequest();
          for (var uid in data.group.uids) {
            Database.ref('/users/' + uid + "/name").once('value').then(function (snapshot) {
              data.group.names.push(snapshot.val())
            }).catch(fncError);
            var ref = firebase.storage().ref('profile_pic/' + uid);
            ref.getDownloadURL().then(function (url) {
              data.group.profilePics.push(url)
            }).catch(fncError)
          }
          data.group.ready = true
        }).catch(fncError)
      }
    });
    var coachRequest = (function() {
      var refConversation = Database.ref('coach/' + data.group.coach + '/conversations/' + data.firebase.uid);
      data.coach = {
        name: "",
        profilePic: "",
        conversation: {}
      }
      var fncConversation = function(snapshot) {
        var value = snapshot.val();
        if (value.name === data.user.name)
        {
          value.style = "right";
          value.color = "calm";
        }
        else
          value.color = "assertive"
        data.coach.conversation[snapshot.getKey()] = value
        if (callback.coach !== false)
          callback.coach()
      };
      refConversation.orderByKey().limitToLast(40).on('child_added', fncConversation)
      refConversation.orderByKey().limitToLast(40).on('child_changed', fncConversation)
      Database.ref('coach/' + data.group.coach + '/name').once('value').then(function(snapshot) {
        data.coach.name = snapshot.val()
        var ref = firebase.storage().ref('profile_pic/' + data.group.coach);
        ref.getDownloadURL().then(function(url) {
          data.coach.profilePic = url;
          data.coach.ready = true
        }).catch(fncError)
      }).catch(fncError)
    });
    firebase.auth().onAuthStateChanged(function(user) {
      if (user !== null) {
        data.firebase.uid = user.uid;
        data.firebase.ready = true;
        userRequest();
        trackRequest();
        $location.path('/tab/account');
      } else {
        $location.path('/tab/login');
      }
    });
    return {
      data: data,
      callback: callback,
      trackingSet: (function (name, value, date) {
        Database.ref('/users/' + data.firebase.uid + '/track/' + date + '/' + name).set(value);
        if (data.user.FWeight === undefined && name === "weight")
          Database.ref('/users/' + data.firebase.uid + "/FWeight").set(value);
      }),
      sendMessage: (function (scope,who) {
        if (scope.message === undefined && scope.img === undefined)
          return
        console.log("Sending : " + Time.getTime() + ", " + scope.message + ", " + scope.img);
        var ref = Database.ref('groups/' + data.user.gid + '/messages/')
        if (who)
          ref = Database.ref('coach/' + data.group.coach + '/conversations/' + data.firebase.uid)
        ref.push({
          time: Time.getTime(),
          msg: scope.message,
          name: data.user.name,
          img: scope.img
        });
      }),
      login: (function (email, password) {
        console.log('login with ' + email);
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(error) {
          console.log("Logedin redirecting");
        }).catch(function(error) {
          console.log(error.code + " : " + error.message);
          alert(error.message)
        });
      }),
      disconnect: (function () {
        firebase.auth().signOut().then(function() {
          data = { firebase: false, profilePic: false, track: false, user: false, group: false, coach: false };
        }, function(error) {
        });
      }),
      register: (function (sFirebase, $scope) {
        data.firebase.register = true;
        firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.passwordP).then(function(error) {
          console.log("Logedin redirecting");
        }).catch(function(error) {
          console.log(error.code + " : " + error.message);
          alert(error.message);
        });
      })
    }
  });
