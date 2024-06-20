'use strict';

var app = angular.module('application', []);

app.controller('AppCtrl', function($scope, appFactory){
   $("#success_init").hide();
   $("#success_qurey").hide();
   $("#success_delete").hide();
   $("#success_transfer").hide();

   $scope.initAB = function(){
       appFactory.initAB($scope.abstore, function(data){
           if(data == "")
           $scope.init_ab = "success";
           $("#success_init").show();
       });
   };
   $scope.queryAB = function(){
       appFactory.queryAB($scope.walletid, function(data){
           $scope.query_ab = data;
           $("#success_qurey").show();
       });
   };
   $scope.deleteAB = function(){
        appFactory.deleteAB($scope.abstore, function(data){
            $scope.delete_ab = "delete";
            $("#success_delete").show();
     });
    };
    $scope.transferAB = function(){
        appFactory.transferAB($scope.transfer, function(data){
            $scope.transfer_ab = "transfer successful";
            $("#success_transfer").show();
        });
      };
});

app.factory('appFactory', function($http){
      
    var factory = {};
 
    factory.initAB = function(data, callback){
        $http.get('/init?a='+data.a+'&aval='+data.aval).success(function(output){
            callback(output)
        });
    }
    factory.queryAB = function(name, callback){
        $http.get('/query?name='+name).success(function(output){
            callback(output)
        });
    }
    factory.deleteAB = function(data, callback){
        $http.get('/delete?a='+data.a).success(function(output){
            callback(output)
        });
    }

    factory.transferAB = function(data, callback){
        $http.get('/transfer?sender='+data.sender+'&receiver='+data.receiver+'&amount='+data.amount).success(function(output){
            callback(output)
        });
    }


    return factory;
 });
 