angular.module('starter.services', ['ionic','firebase'])

  .factory('sFirebase', function ($location) {
    Database = firebase.database()
    Time = new Date()
    TimeFirst =  Time.getDate() - Time.getDay()//First Day of the week
    var data = { firebase: false, profilePic: false, track: false, user: false, group: false }
    var callback = { tracking: false, progress: false}
    var userRequest = (function() {
      Database.ref('/users/' + data.firebase.uid).once('value').then(function(snapshot) {
        data.user = {
          name: snapshot.val().name,
          email: snapshot.val().email,
          age: snapshot.val().age,
          bio: snapshot.val().bio,
          fWeight: snapshot.val().fweight,
          programStart: snapshot.val().programStart,
          gid: snapshot.val().gid,
        }
        data.user.ready = true
        groupRequest()
        firebase.storage().ref('profile_pic/' + data.firebase.uid).getDownloadURL().then(function(url) {
          data.user.profilePic = url // Insert url into an <img> tag to "download"
          data.profilePic = { ready: true }
          }).catch(function(error) {
            console.log(error.code + " : " + error.message)
          });
      }).catch(function (error) {
        console.log(error.code + " : " + error.message)
      })
    })
    var trackRequest = (function() {
      data.track = {
        days: {},
        weighings: [],
        streak: 0,
        lWeight: 0,
        weekSports: [],
        weekSportsTime: 0,
        weekSportsPlan: [],
        healthy: [0, 0, 0]
      }
      var fnc = function(snapshot) {
        data.track.days[snapshot.getKey()] = snapshot.val()
        data.track.weighings = []
        data.track.streak = 0
        data.track.lWeight = 0
        data.track.weekSports = []
        data.track.weekSportsTime = 0
        data.track.weekSportsPlan = []
        data.track.weeksSports = {}
        data.track.healthy = [0, 0, 0]
        for (var day in data.track.days)
        {
          var lastWeekFirst = false
          var lastWeek = false
          var frDate = day.split("-")
          var elemDate = new Date(frDate[0], frDate[1], frDate[2])
          var snapshotChild = data.track.days[day]
          if (snapshotChild.weight != undefined)
            data.track.lWeight = snapshotChild.weigh
          if (elemDate.getMonth() == Time.getMonth()
              && elemDate.getDate() >= TimeFirst && elemDate.getDate() <= TimeFirst + 6)
          {
            if (snapshotChild.sportDay != undefined)
            {
              data.track.weekSportsTime += Number(snapshotChild.sportDay[1])
              data.track.weekSports.push(snapshotChild.sportDay)
            }
            if (snapshotChild.weekSportsPlan != null)
            {
              data.track.weekSportsPlanTime = 0
              data.track.weekSportsPlan = snapshotChild.weekSportsPlan
              for (var index in snapshotChild.weekSportsPlan)
                data.track.weekSportsPlanTime += Number(snapshotChild.weekSportsPlan[index][2])
            }
          }
          if (lastWeek == false || (elemDate.getMonth() != lastWeek.getMonth()
                                    || elemDate.getDate() <= lastWeekFirst || elemDate.getDate() >= lastWeekFirst + 6))
          {
            lastWeek = elemDate
            lastWeekFirst = lastWeek.getDate() - lastWeek.getDay()
            if (snapshotChild.weight != undefined)
            {
              if (data.track.weighings[elemDate] == undefined)
                data.track.weighings[elemDate] = 0
              data.track.weighings[elemDate] += Number(snapshotChild.weight)
            }
            if (data.track.weeksSports[elemDate.getMonth() + "-" + elemDate.getDate()] == undefined)
              data.track.weeksSports[elemDate.getMonth() + "-" + elemDate.getDate()] = 0
            if (snapshotChild.sportDay != undefined)
              data.track.weeksSports[elemDate.getMonth() + "-" + elemDate.getDate()] += Number(snapshotChild.sportDay[1])
          }
          var breakFast = false
          var meals = [snapshotChild.breakFast,
                       snapshotChild.diner, snapshotChild.lunch]
          for (var index in meals)
          {
            if (meals[index] != undefined)
            {
              if (meals[index][0][3] || (meals[index][0][2] && meals[index][0][4]))
                data.track.healthy[2] += 1
              else if (meals[index][0][4] || (meals[index][0][2] && meals[index][0][5]))
                data.track.healthy[1] += 1
              else
                data.track.healthy[0] += 1
            }
          }
        }
        var timeDiff = Math.abs(Time.getTime() - elemDate.getTime());
        data.track.streak = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1;
        if (callback.progress != false)
          callback.progress()
        if (callback.tracking != false)
          callback.tracking()
      }
      var refTracking = Database.ref('/users/' + data.firebase.uid + '/track/')
      refTracking.off()
      refTracking.orderByKey().on('child_added', fnc)
      refTracking.orderByKey().on('child_changed', fnc)
      data.track.ready = true
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
        if (data.group.conversation[index].name == data.user.name)
        {
          data.group.conversation[index].style = "right"
          data.group.conversation[index].color = "calm"
        }
        else
          data.group.conversation[index].color = "assertive"
      }
      refConversation.orderByKey().on('child_added', fncConversation)
      refConversation.orderByKey().on('child_changed', fncConversation)
      Database.ref('/groups/' + data.user.gid).once('value').then(function(snapshot) {
        data.group.uids = snapshot.val().uids
        for (var uid in data.group.uids) {
          Database.ref('/users/' + uid + "/name").once('value').then(function(snapshot) {
            data.group.names.push(snapshot.val())
          }).catch(function (error) {
            console.log(error.code + " : " + error.message)
          })
          var ref = firebase.storage().ref('profile_pic/' + uid);
            ref.getDownloadURL().then(function(url) {
              data.group.profilePics.push(url) // Insert url into an <img> tag to "download"
            }).catch(function(error) {
              console.log(error.code + " : " + error.message)
            });
        }
        data.group.ready = true
      }).catch(function (error) {
        console.log("Groups : " + error.code + " : " + error.message)
      });
    })
    firebase.auth().onAuthStateChanged(function(user) {
        console.log("State of Auth Changed");
        if (user != null) {
          data.firebase = { uid: user.uid }
          console.log("User logged : " + user.uid)
          userRequest()
          trackRequest()
        $location.path('/tab/account');
      } else {
        $location.path('/tab/login')
        console.log("Not loged")
      }
    });
    return {
      data: data,
      callback: callback,
      trackingSet: (function (name, value, date) {
        if (name == "breakFast" || name == "lunch" || name == "diner")
        {
          var prev = data.track.days[date][name]
          if (prev != undefined)
          {
            if (prev[0][3] || (prev[0][2] && prev[0][4]))
              data.track.healthy[2] -= 1
            else if (prev[0][4] || (prev[0][2] && prev[0][5]))
              data.track.healthy[1] -= 1
            else
              data.track.healthy[0] -= 1
          }
        }
        Database.ref('/users/' + data.firebase.uid + '/track/' + date + '/' + name).set(value);
      }),
      sendMessage: (function (scope) {
        console.log("Sending : " + Time.getTime() + ", " + scope.message);
        Database.ref('groups/' + Gid + '/messages/').push({
          time: Time.getTime(),
          msg: scope.message,
          name: Name
        });
      }),
      getCoachMessage: (function (scope) {
        var conversation = Database.ref('coach/' + Uid + '/messages/').limitToLast(40)
        conversation.once('value').then(function(snapshot) {
          scope.conversation = []
          for (var n in snapshot.val()) {
            scope.conversation.push(snapshot.child(n).val())
            if (snapshot.child(n).val().name == Name)
            {
              scope.conversation[scope.conversation.length - 1].style = "right"
              scope.conversation[scope.conversation.length - 1].color = "calm"
            }
            else
              scope.conversation[scope.conversation.length - 1].color = "assertive"
            console.log("Debug=" + n + ", " + snapshot.child(n).val().msg)
            scope.$apply()
          }
        }).catch(function(error) {
          console.log(error.code + " : " + error.message)
        });
      }),
      sendCoachMessage: (function (message) {
        console.log("Sending : " + Time.getTime() + ", " + message);
        Database.ref('coach/' + Uid + '/messages/').push({
          time: Time.getTime(),
          msg: message,
          name: Name
        });
      }),
      login: (function (email, password, sFirebase) {
        console.log('login with ' + email);
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(error) {
          console.log("Logedin redirecting")
        }).catch(function(error) {
          console.log(error.code + " : " + error.message)
          alert(error.message)
        });
      }),
      register: (function (sFirebase, $scope) {
        console.log('register process...')
        firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.passwordP).then(function(error) {
          sFirebase.accountInit($scope.email, $scope.name, $scope.age, $scope.bio, $scope.fileSelected)
          console.log("Logedin redirecting");
        }).catch(function(error) {
          console.log(error.code + " : " + error.message)
          alert(error.message)
        });
      }),
      accountInit: (function (email, name, age, bio, pic) {
        console.log('init user data ...')
        Database.ref('users/' + Uid).set({
          name: name,
          email: email,
          age: age,
          bio: bio,
          gid: "false"
        });
        var profileRef = firebase.storage().ref().child('profile_pic/' + uid);
        profileRef.put(pic).then(function(snapshot) {
          console.log('Uploaded file.');
        }).catch(function(error) {
          console.log(error.code + " : " + error.message)
          alert(error.message)
        });
      })
    }
  });
