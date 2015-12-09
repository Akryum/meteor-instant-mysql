# Meteor Mysql
## Reactive &amp; Easy to use

# Usage

```js
//Your client side DOES NOT REQUIRE ANY CHANGES!!!
 if (Meteor.isClient) {

     Posts = new Mongo.Collection("postsCollection");
     Meteor.subscribe('allPosts')
 }

if(Meteor.isServer){
	Meteor.startup(function() {

	//Start of changes

	var mysqlStringConnection = 	"mysql://yourusername:yourpassword@127.0.0.1/yourdatabase? debug=false&charset=utf8";

	var db = Mysql.connect(mysqlStringConnection);
	//"posts" -> a table name inside your database.
	Posts = db.meteorCollection("posts", "postsCollection");

	//End of changes, that's it!

//publish the collection as you used to do with Mongo.Collection
	 Meteor.publish("allPosts", function(){
                return Posts.find();
     });

	});
}

```