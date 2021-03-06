var waitready = function(val, fnc, id, $interval) {
  if (val.ready === true)
  {
    $interval.cancel(id);
    return fnc()
  }
}

angular.module('starter.controllers', ['firebase', 'ionic', 'ngCordova'])
  .controller('TrackCtrl', function($scope, sFirebase, $interval) {
    var d = new Date();
    $scope.aDay = d.getDate();
    $scope.aMonth = d.getMonth()+1;
    var weekday = [ "Lundi", "Mardi", "Mercredi", "Jeudi",
                    "Vendredi", "Samedi", "Dimanche" ];
    var monthNames = [ "January", "February", "March", "April",
                       "May", "June", "July", "August", "September",
                       "October", "November", "December" ];
    var sports = [ "Jogging", "Marche Rapide", "Natation", "Fitness",
                   "Danse", "Sport de combat", "Sport collectif" ];
    var periods = [ 15, 30, 45, 60, 90, 120, 150 ];
    $scope.monthNames = monthNames;
    $scope.weekday = weekday;
    $scope.sports = sports;
    $scope.periods = periods;
    $scope.today = d.getDay() === 0 ? 6 : d.getDay() - 1;
    $scope.dayMonth = d.getDate();
    $scope.month = d.getMonth()+1;
    $scope.planningSp = [];
    $scope.planningSpD = [];
    $scope.selectedSp = [];
    var selectedDate = d.getFullYear() + '-' + (d.getMonth()+1) + '-'
        + (d.getDate() > 9 ?  d.getDate() : '0' + d.getDate());

    $scope.changeDate = function(nb) {
      d.setDate(d.getDate() + nb);
      selectedDate = d.getFullYear() + '-' + (d.getMonth()+1) + '-'
          + (d.getDate() > 9 ?  d.getDate() : '0' + d.getDate());
      $scope.today = d.getDay() === 0 ? 6 : d.getDay() - 1;
      $scope.dayMonth = d.getDate();
      $scope.month = d.getMonth()+1;
      $scope.updateTrack()
    }

    $scope.setSpPlan = function() {
      if ($scope.weekSportsPlan.length > 0)
      {
        if (!confirm("Etes vous sur de vouloir envoyer votre planing, il ne sera plus modifiable avant la semaine prochaine"))
          return ;
        // Select the first day as container
        var firstDayWeek = new Date();
        firstDayWeek.setDate(d.getDate() - d.getDay());
        var selectedDate = firstDayWeek.getFullYear() + '-' + (firstDayWeek.getMonth()+1) + '-'
            + (firstDayWeek.getDate() > 9 ? firstDayWeek.getDate() : '0' + firstDayWeek.getDate());
        sFirebase.trackingSet("weekSportsPlan", $scope.weekSportsPlan, selectedDate);
        $scope.validSpPlan = true;
        $scope.toggleSpPlan = false;
      }
      else
        alert("Votre planning d'activite est vide");
    };

    $scope.addSpPlan = function() {
      if ($scope.planDay !== null && $scope.planSport !== null
          && $scope.planPeriod !== undefined)
      {
        $scope.weekSportsPlan.push([$scope.planDay, $scope.planSport, $scope.planPeriod])
        if ($scope.weekSportsPlanTime === undefined)
          $scope.weekSportsPlanTime = 0;
        $scope.weekSportsPlanTime += Number($scope.planPeriod);

        //RESET Fields
        $scope.planDay = undefined;
        $scope.planSport = undefined;
        $scope.planPeriod = undefined;
      }
      else
        alert("Sport description is incomplete");
    }

    $scope.deletePlan = function(index) {
      $scope.weekSportsPlanTime -= $scope.weekSportsPlan[index][2];
      $scope.weekSportsPlan.splice(index, 1);
    }

    $scope.updateChoice = function(nb, type) {
      var meals = [$scope.selectedBF, $scope.selectedLC, $scope.selectedDN]
      meals[type][Math.floor(nb / 3) * 3] = null
      meals[type][Math.floor(nb / 3) * 3 + 1] = null
      meals[type][Math.floor(nb / 3) * 3 + 2] = null
      meals[type][nb] = true
    }

    $scope.updateTrack = function() {
      trackingDay($scope)
    }

    $scope.setTrack = function(elem, name) {
      if (name === "weight" && elem > 0)
      {
        if (weight > 500)
          return alert("Plus de 500 Kilos ?");
        $scope.toggleWeight = false;
        sFirebase.trackingSet(name, elem, selectedDate);
      }
      else if (name === "steps" && elem > 0)
      {
        $scope.toggleSteps = false;
        sFirebase.trackingSet(name, elem, selectedDate)
      }
      else if (name === "sportDay" &&
        $scope.sportDay !== undefined && $scope.sportDayTime !== undefined)
      {
        elem = [ $scope.sportDay, $scope.sportDayTime];
        sFirebase.trackingSet(name, elem, selectedDate);
        $scope.toggleSport = false
        }
    };

    $scope.setBF = function() {
      var count = 0;
      for (var e in $scope.selectedBF)
        if ($scope.selectedBF[e] !== null)
          count += 1;
      if (count === 2 && $scope.iDescBF !== undefined && $scope.iDescBF.length > 0) {
        sFirebase.trackingSet("breakFast", [$scope.selectedBF, $scope.iDescBF], selectedDate);
        $scope.validBF = true;
        $scope.toggleBF = false;
      }
      else
        alert("La description de votre repas est incomplete");
    };

    $scope.setLC = function() {
      var count = 0;
      for (var e in $scope.selectedLC)
        if ($scope.selectedLC[e] !== null)
          count += 1;
      if (count === 2 && $scope.iDescLC !== undefined && $scope.iDescLC.length > 0)
      {
        sFirebase.trackingSet("lunch", [$scope.selectedLC, $scope.iDescLC], selectedDate);
        $scope.validLC = true;
        $scope.toggleLC = false;
      }
      else
        alert("La description de votre repas est incomplete");
    }

    $scope.setDN = function() {
      var count = 0;
      for (var e in $scope.selectedDN)
        if ($scope.selectedDN[e] !== null)
          count += 1;
      if (count === 2 && $scope.iDescDN !== undefined  && $scope.iDescDN.length > 0)
      {
        sFirebase.trackingSet("diner", [$scope.selectedDN, $scope.iDescDN], selectedDate);
        $scope.validDN = true;
        $scope.toggleDN = false;
      }
      else
        alert("La description de votre repas est incomplete");
    }

    var trackingDay = function (scope) {
      var val = sFirebase.data.track.days[selectedDate];

      if (val === undefined)
      {
        scope.iweight = undefined;
        scope.validWeight = false;
        scope.isteps = undefined;
        scope.validSteps = false;
        scope.selectedBF = [];
        scope.validBF = false;
        scope.selectedLC = [];
        scope.validLC = false;
        scope.validSport = false;
        scope.iTimeSp = undefined;
        scope.selectedDN = [];
        scope.validDN = false;
        scope.iDescBF = undefined
      }
      else
      {
          if (val.weight !== undefined) {
            scope.iweight = val.weight;
            scope.validWeight = true
          } else {
            scope.iweight = undefined;
            scope.validWeight = false
          }

          //Steps
          if (val.steps !== undefined) {
            scope.isteps = val.steps;
            if (val.steps >= 8000)
              scope.validSteps = true;
            else
              scope.validSteps = false;
          } else {
            scope.isteps = undefined;
            scope.validSteps = false
          }

          //Sport
          if (val.sportDay !== undefined) {
            scope.iTimeSp = val.sportDay[1];
            scope.selectedSp = val.sportDay[0];
            scope.validSport = true
          } else {
            scope.iTimeSp = undefined
            scope.validSport = false
            scope.selectedSp = []
          }

          // Break Fast
          scope.validBF = true;
          if (val.breakFast !== undefined)
          {
            scope.selectedBF = val.breakFast[0];
            scope.iDescBF = val.breakFast[1]
          }
          else
          {
            scope.validBF = false;
            scope.selectedBF = [];
            scope.iDescBF = undefined;
          }

          // Lunch
          scope.validLC = true;
          if (val.lunch !== undefined)
          {
            scope.selectedLC = val.lunch[0];
            scope.iDescLC = val.lunch[1];
          }
          else
          {
            scope.validLC = false;
            scope.selectedLC = [];
            scope.iDescLC = undefined;
          }

          // DINER
          scope.validDN = true;
          if (val.diner !== undefined)
          {
            scope.selectedDN = val.diner[0];
            scope.iDescDN = val.diner[1];
          }
          else
          {
            scope.selectedDN = [];
            scope.validDN = false;
            scope.iDescDN = undefined;
          }
      }

      if (sFirebase.data.track.weekSportsPlan.length > 0)
      {
        scope.weekSportsPlan = sFirebase.data.track.weekSportsPlan;
        scope.validSpPlan = true;
      }
      else
        scope.weekSportsPlan = [];
    };

    var headerDisplay = function() {
      var programStartD = new Date(sFirebase.data.user.programStart);
      var LWeight = sFirebase.data.track.LWeight;
      var FWeight = sFirebase.data.user.FWeight;
      $scope.userPic = sFirebase.data.user.profilePic;
      $scope.programTime = Math.round((d - programStartD)/ 604800000);
      $scope.progress = (FWeight - LWeight) / (FWeight * 0.1);
      if (isNaN($scope.progress) || $scope.progress < 0)
        $scope.progress = 0;
      $scope.circle.animate($scope.progress);
    };

    sFirebase.callback.tracking = (function() { trackingDay($scope) });
    var id1 = $interval(function() {
      waitready(sFirebase.data.track, sFirebase.callback.tracking, id1, $interval)
    }, 100);

    var id2 = $interval(function() {
      waitready(sFirebase.data.profilePic, headerDisplay, id2, $interval)
    }, 100);

    $scope.circle = new ProgressBar.Circle("#progressBarT", {
      strokeWidth: 10,
      color: '#73BF5A'
    });
  })

  .controller('GroupCtrl', function($scope, $interval, sFirebase) {
    var groupDisplay = function(scope) {
      scope.Gnames = sFirebase.data.group.gNames;
      scope.conversation = sFirebase.data.group.conversation;
      scope.Guids = sFirebase.data.group.uids;
      scope.GprofilePic = sFirebase.data.group.profilePics;
      scope.Gnames = sFirebase.data.group.names;
    }

    sFirebase.callback.groupDisplay = (function() { groupDisplay($scope) });
    var id1 = $interval(function() {
      waitready(sFirebase.data.group, sFirebase.callback.groupDisplay, id1, $interval)
    }, 500);
  })

  .controller('AccountCtrl', function($scope, $interval, sFirebase) {
    // round corners
	  Chart.pluginService.register({
		  afterUpdate: function (chart) {
			  if (chart.config.options.elements.arc.roundedCornersFor !== undefined) {
				  var arc = chart.getDatasetMeta(0).data[chart.config.options.elements.arc.roundedCornersFor];
          if (arc === undefined)
            return ;
				  arc.round = {
					  x: (chart.chartArea.left + chart.chartArea.right) / 2,
					  y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
					  radius: (chart.outerRadius + chart.innerRadius) / 2,
					  thickness: (chart.outerRadius - chart.innerRadius) / 2 - 1,
					  backgroundColor: arc._model.backgroundColor
				  }
			  }
		  },
		  afterDraw: function (chart) {
			  if (chart.config.options.elements.arc.roundedCornersFor !== undefined) {
				  var ctx = chart.chart.ctx;
				  var arc = chart.getDatasetMeta(0).data[chart.config.options.elements.arc.roundedCornersFor];
          if (arc === undefined || arc.round === undefined || arc.round.thickness < 0)
            return ;
          var startAngle = Math.PI / 2 - arc._view.startAngle;
				  var endAngle = Math.PI / 2 - arc._view.endAngle;
				  ctx.save();
				  ctx.translate(arc.round.x, arc.round.y);
				  ctx.fillStyle = arc.round.backgroundColor;
				  ctx.beginPath();
				  ctx.arc(arc.round.radius * Math.sin(startAngle), arc.round.radius * Math.cos(startAngle), arc.round.thickness, 0, 2 * Math.PI);
				  ctx.arc(arc.round.radius * Math.sin(endAngle), arc.round.radius * Math.cos(endAngle), arc.round.thickness, 0, 2 * Math.PI);
				  ctx.closePath();
				  ctx.fill();
				  ctx.restore();
			  }
		  },
	  });
	  // write text plugin
	  Chart.pluginService.register({
		  afterUpdate: function (chart) {
			  if (chart.config.options.elements.center) {
				  var helpers = Chart.helpers;
				  var centerConfig = chart.config.options.elements.center;
				  var globalConfig = Chart.defaults.global;
				  var ctx = chart.chart.ctx;

				  var fontStyle = helpers.getValueOrDefault(centerConfig.fontStyle, globalConfig.defaultFontStyle);
				  var fontFamily = helpers.getValueOrDefault(centerConfig.fontFamily, globalConfig.defaultFontFamily);

				  if (centerConfig.fontSize)
					  var fontSize = centerConfig.fontSize;
					// figure out the best font size, if one is not specified
				  else {
					  ctx.save();
					  var fontSize = helpers.getValueOrDefault(centerConfig.minFontSize, 1);
					  var maxFontSize = helpers.getValueOrDefault(centerConfig.maxFontSize, 256);
					  var maxText = helpers.getValueOrDefault(centerConfig.maxText, centerConfig.text);

					  do {
						  ctx.font = helpers.fontString(fontSize, fontStyle, fontFamily);
						  var textWidth = ctx.measureText(maxText).width;

						  // check if it fits, is within configured limits and that we are not simply toggling back and forth
						  if (textWidth < chart.innerRadius * 2 && fontSize < maxFontSize)
							  fontSize += 1;
						  else {
							  // reverse last step
							  fontSize -= 1;
							  break;
						  }
					  } while (true)
					  ctx.restore();
				  }

				  // save properties
				  chart.center = {
					  font: helpers.fontString(fontSize, fontStyle, fontFamily),
					  fillStyle: helpers.getValueOrDefault(centerConfig.fontColor, globalConfig.defaultFontColor)
				  };
			  }
		  },
		  afterDraw: function (chart) {
			  if (chart.center) {
				  var centerConfig = chart.config.options.elements.center;
				  var ctx = chart.chart.ctx;
				  ctx.save();
				  ctx.font = chart.center.font;
				  ctx.fillStyle = chart.center.fillStyle;
				  ctx.textAlign = 'center';
				  ctx.textBaseline = 'middle';
				  var centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
				  var centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
				  ctx.fillText(centerConfig.text, centerX, centerY);
				  ctx.restore();
			  }
		  },
	  })
    Chart.defaults.global.defaultFontSize = 20;
    var configWeight = {
      labels: [],
      datasets: [
        {
          label: "Ma courbe de poids",
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 4,
          pointHitRadius: 10,
          data: 0,
          spanGaps: true,
        }
      ]
    };
	  var configSport = {
        labels: ['Activite Sportive', 'Objectif'],
			  datasets: [{
				  data: 0,
				  backgroundColor: [
					  "#008000",
					  "#32CD32"
				  ],
				  hoverBackgroundColor: [
					  "#008000",
					  "#32CD32"
				  ]
			  }]
	  };
	  var configWeeks = {
  		datasets: [{
				data: [],
				backgroundColor: [
          "#FF6384",
          "#36A2EB",
				  ],
				hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
				  ]
			  }]
	  };
   var configHealthy = {
      labels: [
        "Approuvée par le coach",
        "Pas très Physis",
        "Du bon et du moins bon"
      ],
      datasets: [
        {
          data: 0,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ]
        }]
    }

    $scope.chartWeightUp = function () {
      if ($scope.chartWeight !== undefined)
        $scope.chartWeight.destroy()
      configWeight.datasets[0].data = $scope.weighings;

      $scope.chartWeight = new Chart("chartWeight", {
        type: 'line',
        data: configWeight,
        options: {
          fill: true,
          backgroundColor: '#cc65fe'
        }
      });
    };

    var weeksUp = function() {
      for (var n in $scope.chartWeeks)
      {
        if ($scope.chartWeeks[n] !== null)
        {
          $scope.chartWeeks[n].destroy()
          $scope.chartWeeks[n] = null
        }
      }
      var n = 0
      for (var e in $scope.weeksSports)
      {
        $scope.chartWeeks[n] = new Chart("chartWeek" + n, {
          type: 'doughnut',
          data: configWeeks,
          options: {
            cutoutPercentage: 80,
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },
			      elements: {
				      center: {
					      maxText: '100%',
					      text: $scope.weeksSports[e],
					      fontColor: '#008000',
					      fontStyle: 'normal',
					      minFontSize: 2,
					      maxFontSize: 34,
				      }
			      }
          }
        });
        $scope.chartWeeks[n].data.datasets[0].data = [ $scope.weeksSports[e], 150 - $scope.weeksSports[e] ];
        $scope.chartWeeks[n].update();
        ++n;
      }
    };

    $scope.chartSportUp = function () {
      if ($scope.chartSport !== undefined)
        $scope.chartSport.destroy()
      configSport.datasets.data = $scope.sport
      $scope.chartSport = new Chart("chartSport", {
        type: 'doughnut',
        data: configSport,
        options: {
          cutoutPercentage: 85,
          legend: { display: false },
			    elements: {
				    arc: {
					    roundedCornersFor: 0
				    },
				    center: {
					    maxText: '80%',
					    text: "0 minutes effectuées",
					    fontColor: '#008000',
					    fontStyle: 'normal',
					    minFontSize: 2,
					    maxFontSize: 30,
				    }
			    }
        }
      });
      setTimeout(weeksUp, 500);
    };

    $scope.chartHealthyUp = function () {
      if ($scope.healthy === undefined)
        $scope.healthy = [1, 1, 1];
      if ($scope.chartHealthy !== undefined)
        $scope.chartHealthy.destroy();
      configHealthy.datasets[0].data = $scope.healthy;
      $scope.chartHealthy = new Chart("chartHealthy", {
        type: 'doughnut',
        data: configHealthy,
        options: {
          rotation: Math.PI,
          circumference: Math.PI
        }
      });
    };

    $scope.updateWeighChart = function() {
      if ($scope.weightingsGraphState)
        $scope.weighings = sFirebase.data.track.weekWeighings;
      else
        $scope.weighings = sFirebase.data.track.monthWeighings;
      var length = Object.keys($scope.weighings).length;
      $scope.chartWeight.data.datasets[0].data = [];
      $scope.chartWeight.data.labels = [];
      for (var w in $scope.weighings)
      {
        if (length > 5)
          --length;
        else
        {
          var frDate = w.split("-");
          var elemDate = new Date(frDate[0], frDate[1], frDate[2]);
          $scope.chartWeight.data.datasets[0].data.push($scope.weighings[w]);
          $scope.chartWeight.data.labels.push(elemDate.getDate() + "/" + elemDate.getMonth());
        }
      }
      $scope.chartWeight.update();
    };

    //START DEFINITION
    $scope.chartWeight = undefined;
    $scope.chartHealthy = undefined;
    $scope.chartSport = undefined;
    $scope.chartWeeks = [];
    $scope.sport = [1, 1, 1];
    $scope.weighings = [1, 1, 1];
    $scope.healthy = [1, 1, 1];
    $scope.weeks = [1, 2, 3, 4, 5, 6];
    $scope.selectedPage = 1; // Selected page
    $scope.weightingsGraphState = true; // Selected mode for weightings

    $scope.chartWeightUp();
    $scope.chartSportUp();
    $scope.chartHealthyUp();

    var displayProgress = function (scope) {
      var track = sFirebase.data.track;
      scope.PrgramStart = sFirebase.data.user.programStart;

      scope.FWeight = sFirebase.data.user.FWeight;
      scope.LWeight = track.LWeight;
      scope.weekSportsPlanTime = sFirebase.data.track.weekSportsPlanTime || 0;
      scope.weekSportsObjectiv = [ track.weekSportsTime, 150 - track.weekSportsTime ];
      //  scope.Streak = track.streak;

      scope.weighings = sFirebase.data.track.weekWeighings;
      scope.updateWeighChart();

      if (sFirebase.data.user.healthy !== undefined)
        scope.healthy = sFirebase.data.user.healthy;
      scope.chartHealthy.data.datasets[0].data = scope.healthy;
      scope.chartHealthy.update();

      scope.weekSportsTime = Math.round(track.weekSportsTime);
      if ($scope.weekSportsTime === undefined)
        $scope.weekSportsTime = 0;
      scope.chartSport.data.datasets[0].data = $scope.weekSportsObjectiv;
      scope.chartSport.options.elements.center.text = ($scope.weekSportsTime + " minutes effectuées");
      scope.chartSport.update();

      scope.weeksSports = track.weeksSports;
      var i = 0;
      for (var e in $scope.weeksSports)
      {
       if (scope.chartWeeks[i] !== undefined)
       {
         scope.chartWeeks[i].options.elements.center.text = $scope.weeksSports[e];
         scope.chartWeeks[i].data.datasets[0].data = $scope.weeksSports[e];
         scope.chartWeeks[i].update();
       }
       ++i
      }

      scope.circle.animate((scope.FWeight - scope.LWeight) / (scope.FWeight * 0.1));
     };

    sFirebase.callback.progress = function() { displayProgress($scope) };
    var id1 = $interval(function() {
      waitready(sFirebase.data.user, (function() {
        sFirebase.callback.progress();
      }), id1, $interval);
    }, 200);

    var id2 = $interval(function() {
      waitready(sFirebase.data.profilePic, (function() {
        $scope.userPic = sFirebase.data.user.profilePic
      }), id2, $interval);
    }, 200);

    $scope.circle = new ProgressBar.Circle("#progressBarP", {
      strokeWidth: 10,
      color: '#73BF5A'
    });
  })

  .controller('LoginCtrl', function($scope, $ionicLoading, sFirebase) {
    $scope.login = function(email, password) {
      if (!password || !email)
        return ;
      $ionicLoading.show({
        template: 'Loading...',
        duration: 3000
      });
      sFirebase.login(email, password);
      $ionicLoading.hide();
    }
  })

  .controller('RegisterCtrl', function($scope, sFirebase) {
    $scope.email_onChange = function(){
      var icon = angular.element(document.querySelector('.icon-paper-plane'));
        if ($scope.email) {
          icon.addClass("next");
        } else {
          icon.removeClass("next");
        }
      }

    $scope.next_hover = function() {
      var next = angular.element(document.querySelector('.next-button'));
      next.css('cursor', 'pointer');
    };

    $scope.next_button_email = function() {
      var email_section = angular.element(document.querySelector('.email-section'));
      var password_section = angular.element(document.querySelector('.password-section'));
      email_section.addClass("fold-up");
      password_section.removeClass("folded");
    };

    $scope.password_onChange = function() {
      var icon = angular.element(document.querySelector('.icon-lock'));
      if ($scope.password && $scope.password.length > 5) {
        icon.addClass("next");
      } else {
        icon.removeClass("next");
      }
    };

    $scope.next_button_password = function() {
      var password_section = angular.element(document.querySelector('.password-section'));
      var repeat_password_section = angular.element(document.querySelector('.repeat-password-section'));
      password_section.addClass("fold-up");
      repeat_password_section.removeClass("folded");
    };

    $scope.repeat_password_onChange = function() {
      var icon = angular.element(document.querySelector('.icon-repeat-lock'));
      if ($scope.repeat_password === $scope.password) {
        icon.addClass("next");
      } else {
        icon.removeClass("next");
      }
    };

    $scope.next_button_repeat_password = function() {
      var repeat_password_section = angular.element(document.querySelector('.repeat-password-section'));
      var name_section = angular.element(document.querySelector('.name-section'));
      repeat_password_section.addClass("fold-up");
      name_section.removeClass("folded");
    };

    $scope.name_onChange = function() {
      var icon = angular.element(document.querySelector('.icon-name'));
      if ($scope.name && $scope.name.length > 2) {
        icon.addClass("next");
      } else {
        icon.removeClass("next");
      }
    };

    $scope.next_button_name = function() {
      var name_section = angular.element(document.querySelector('.name-section'));
      var age_section = angular.element(document.querySelector('.age-section'));
      name_section.addClass("fold-up");
      age_section.removeClass("folded");
    };

    $scope.age_onChange = function() {
      var icon = angular.element(document.querySelector('.icon-age'));
      if ($scope.age && $scope.age > 13) {
        icon.addClass("next");
      } else {
        icon.removeClass("next");
      }
    };

    $scope.next_button_age = function() {
      var age_section = angular.element(document.querySelector('.age-section'));
      var avatar_section = angular.element(document.querySelector('.avatar-section'));
      age_section.addClass("fold-up");
      avatar_section.removeClass("folded");
    };

    $scope.next_button_avatar = function() {
      var age_section = angular.element(document.querySelector('.age-section'));
      var success = angular.element(document.querySelector('.success'));
      age_section.addClass("fold-up");
      success.css("marginTop", 0);
      $scope.submit();
    };

    $scope.submit = function() {
      if (!$scope.password || !$scope.email || !$scope.fileSelected)
        return ;
      if ($scope.bio === undefined)
          $scope.bio = "Non renseigné";

      sFirebase.data.user = { email: $scope.email, name: $scope.name, age: $scope.age, bio: $scope.bio, profilePic: $scope.fileSelected };
      sFirebase.register(sFirebase, $scope);
    };
  })

  .controller('CoachCtrl', function($scope, sFirebase, $interval) {
    var coachDisplay = function(scope) {
      scope.conversation = sFirebase.data.coach.conversation
      scope.coachName = sFirebase.data.coach.name
      scope.coachPic = sFirebase.data.coach.profilePic
      if(!scope.$$phase) { scope.$apply() }
    }
    sFirebase.callback.coach = (function() { coachDisplay($scope) });
    var id1 = $interval(function() {
      waitready(sFirebase.data.coach, sFirebase.callback.coach,
                id1, $interval)}, 500);
  })

  .controller('inputCtrl', function($scope, sFirebase) {
    $scope.img = "";
    $scope.message = "";
    $scope.sendMsg = function(who) {
      sFirebase.sendMessage($scope, who);
      $scope.message = undefined;
    };
    if (typeof Camera !== 'undefined')
    {
      $scope.camera = true;
      $scope.takePhoto = function () {
        var options = {
          quality: 75,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(function (imageData) {
          $scope.imgURI = "data:image/jpeg;base64," + imageData;
        }, function (err) {
          // An error occured. Show a message to the user
        });
      };

      $scope.choosePhoto = function () {
        var options = {
          quality: 75,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(function (imageData) {
          $scope.imgURI = "data:image/jpeg;base64," + imageData;
        }, function (err) {
          // An error occured. Show a message to the user
        });
      }
    }
    else
      $scope.camera = false
  })

  .controller('DisconnectCtrl', function($scope, sFirebase) {
    $scope.disconnect = function() {
      sFirebase.disconnect();
    };
  })

  .controller('LessonCtrl', function($scope, sFirebase, $interval) {
  });
