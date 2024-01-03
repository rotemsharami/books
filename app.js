var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngCookies']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        })
        .when('/booklist', {
            templateUrl: 'views/booklist.html',
            controller: 'BookListController'
        })
        .when('/book/:bookId', {
            templateUrl: 'views/book.html',
            controller: 'BookController'
        })
        .when('/favorites', {
            templateUrl: 'views/favorites.html',
            controller: 'FavoritesController'
        })
        .otherwise({
            redirectTo: '/'
        });
});

app.controller('LoginController', function ($scope, $location) {
    $scope.login = function () {
        $location.path('/booklist');
    };
});

app.controller('BookListController', function ($scope, $http, $cookies) {
    let obj = this;
    obj.favorites = $scope.cookieValue = $cookies.get('favoritesBooks') != undefined;
    $scope.curPage = 1,
    $scope.itemsPerPage = 3,
    $scope.maxSize = 20;
    obj.searchByText = "";
        obj.searchBooks = () => {
            var apiUrl = 'https://www.googleapis.com/books/v1/volumes';
            var params = {
              q: obj.searchByText == "" ? '""' : obj.searchByText,
              key: ""
            };
            $http.get(apiUrl, { params: params }).then(function (response) {
                    obj.books = response.data.items;
                    $scope.numOfPages = function () {
                        if(obj.books != undefined)
                            return Math.ceil(obj.books.length / $scope.itemsPerPage);
                    };
                    $scope.$watch('curPage + numPerPage', function () {
                        if(obj.books != undefined){
                            var begin = (($scope.curPage - 1) * $scope.itemsPerPage),
                                end = begin + $scope.itemsPerPage;
                                $scope.filteredItems = obj.books.slice(begin, end);
                        }
                    });
                }).catch(function (error) {
                console.error('Error fetching books:', error);
            });
        }
        obj.searchBooks();
});


app.controller('BookController', function ($scope, $http, $routeParams, $cookies) {
    let obj = this;
    let coockies_value = $scope.cookieValue = $cookies.get('favoritesBooks');
    obj.setFavorite = (id) => {
        let list = [];
        if(coockies_value == undefined){
            list = [id];
        }
        else{
            list = JSON.parse(coockies_value);
            list.push(id);
        }
        $cookies.put('favoritesBooks', JSON.stringify(list));
        obj.isFavorite = true;
    }

    obj.removeFromFavorite = (id) => {
        list = JSON.parse($cookies.get('favoritesBooks'));
        var newList = list.filter(function (itemId) {
            return itemId != id;
        });
        if(newList.length == 0)
            $cookies.remove('favoritesBooks');
        else
            $cookies.put('favoritesBooks', JSON.stringify(newList));
        obj.isFavorite = false;
    }
    obj.isFavorite = false;
    if(coockies_value != undefined)
        obj.isFavorite = JSON.parse(coockies_value).includes($routeParams.bookId);
    $http.get('https://www.googleapis.com/books/v1/volumes/'+$routeParams.bookId)
        .then(function (response) {
            obj.book = response.data;
            return obj;
        });
});

app.controller('FavoritesController', function ($scope, $http, $cookies) {
    let obj = this;
    let coockies_value = $cookies.get('favoritesBooks')
    if(coockies_value != undefined){
        obj.list = JSON.parse(coockies_value);
        var apiKey = '';
        var apiUrl = 'https://www.googleapis.com/books/v1/volumes';
        obj.items = [];
        angular.forEach(obj.list, function (bookId) {
            var params = { key: apiKey };
            var url = `${apiUrl}/${bookId}`;
            $http.get(url, { params: params })
              .then(function (response) {
                if (response.data.volumeInfo) {
                    obj.items.push(response.data);
                }
              })
              .catch(function (error) {
                console.error('Error fetching book details:', error);
              });
          });
          return obj;
    }
});