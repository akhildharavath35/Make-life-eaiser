//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongodb+srv://akhilcruise:akhilcruise@cluster0-7p2th.mongodb.net/

mongoose.connect("mongodb+srv://akhilcruise:akhilcruise@cluster0-7p2th.mongodb.net/todolistDB", {userNewUrlParser : true}  )

//Items Schema
const itemsSchema = {
  name : String
};





//creating a dbmodel(collection)
const Item = mongoose.model("Item" , itemsSchema)


//creating new documents with mongoose
const Item1 = new Item({
  name  : "Have a Breakfast"
})

const Item2 = new Item({
  name  : "Have a lunch"
})

const Item3 = new Item({
  name  : "Have a Dinner"
})

const defaultItems = [Item1,Item2,Item3];

//console.log(Item.length)


const listSchema = {
  name: String,
  items : [itemsSchema]
}


const List = mongoose.model("List",listSchema)


/* const home = new List({
  name : "college",
  items : defaultItems
})

home.save() */


const day = date.getDate();


const homeItems = [];
const workItems = [];
const schoolItems = [];
const collegeItems = [];

app.get("/", function(req, res) {

    
    Item.find({},{__v:0},function(err,founditems){
      if(err)
        console.log("error during Items Find")
      else
        if(founditems.length === 0)
        {
            //default items
            Item.insertMany(defaultItems, function(err,res){
              if(err)
                console.log("error during inserting items")
              else
                //console.log(Item.length)
                console.log("Successfully inserted items")
            });
            res.redirect('/');
          
        }
        else
        {
          res.render("list", {listTitle: day,  newListItems: founditems});
        }
    })

  

});


app.get("/:type",function(req,res){
  const listitem = req.params.type

  List.findOne({name : listitem} , function(err,foundlist){
    if(!err)
      if(foundlist)
      {
        if(foundlist.items.length ==0)
        {
          console.log("items array is empty")
        }
        console.log("exists",foundlist)
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
      }
        
  })
})






app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname = req.body.listname;

  const item = new Item({
    name : itemName
  })


  if(listname == day)
  {
  
    item.save();
    res.redirect("/")
  }
  else
  {
    List.findOne({name : listname} , function(err,found){
      if(err)
        console.log(err)
      else if(found.length != 0)
      {
        found.items.push(item)
        found.save();
        res.redirect("/"+ listname)
        console.log("Inserted")
      }

      else
        console.log("Not found")
        
    })
  }


  
  







/*   if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  } */
});


app.post("/remove",function(req,res){
  const Item_id = (req.body.checkbox)
  const listName = (req.body.list)
  console.log(Item_id,req.body.list)


  if(listName == day)
  {
      //deleting item from database
      Item.deleteOne({_id:Item_id} , function(err,succ){
        if(err)
          console.log("error during item deletion")
        else
          console.log("Successfully removed")
      })
      res.redirect("/")

  }
  else
  {
        List.findOneAndUpdate({name : listName} , {$pull : {items:{_id:Item_id} }} , function(err,found){
          if(err)
            console.log(err)
          else if(found.length != 0)
          {
            
            res.redirect("/"+ listName)
            console.log("Removed")
          }

          else
            console.log("Not found")
            
        })
  }


  
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started ");
});
