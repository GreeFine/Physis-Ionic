angular.module('starter.directives', ['ionic'])
  .directive("fileread", [function () {
    return {
      scope: {
        fileread: "="
      },
      link: function (scope, element, attributes) {
        element.bind("change", function (changeEvent) {
          scope.$apply(function () {
            console.log("File selected")
            scope.fileread = changeEvent.target.files[0]
          });
        });
      }
    }
  }])

  .directive("chatupload", [function () {
    return {
      scope: {
        chatupload: "="
      },
      link: function (scope, element, attributes) {
        element.bind("change", function (changeEvent) {
          scope.$apply(function () {
            console.log("Chat : File selected")
            if (confirm("Image selectione : " + changeEvent.target.files[0].name + " ?"))
            {
              var uid = firebase.auth().currentUser.uid
              var profileRef = firebase.storage().ref().child('chat_img/' + uid + "/" + Time.getTime());
              profileRef.put(changeEvent.target.files[0]).then(function(snapshot) {
                console.log('Chat: file uploaded.');
                console.log("Sending : " + Time.getTime() + ", " + scope.message);
                Database.ref('groups/' + Gid + '/messages/').push({
                  time: Time.getTime(),
                  msg: "",
                  name: Name,
                  img: snapshot.downloadURL
                });
              }).catch(function(error) {
                console.log(error.code + " : " + error.message)
                alert(error.message)
              });
            }
          });
        });
      }
    }
  }]);
