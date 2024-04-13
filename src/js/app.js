App = {
 webProvider: null,
 contracts: {},
 account: '0x0',


 init: function() {
   return App.initWeb();
 },


 initWeb:function() {
   // if an ethereum provider instance is already provided by metamask
   const provider = window.ethereum
   if( provider ){
     // currently window.web3.currentProvider is deprecated for known security issues.
     // Therefore it is recommended to use window.ethereum instance instead
     App.webProvider = provider;
   }
   else{
     $("#loader-msg").html('No metamask ethereum provider found')
     console.log('No Ethereum provider')
     // specify default instance if no web3 instance provided
     App.webProvider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
   }


   return App.initContract();
 },


initContract: function() {


   $.getJSON("PatientManagement.json", function( PatientManagement ){
     // instantiate a new truffle contract from the artifict
     App.contracts.PatientManagement = TruffleContract( PatientManagement );


     // connect provider to interact with contract
     App.contracts.PatientManagement.setProvider( App.webProvider );


     App.listenForEvents();


     return App.render();
   })


 },



render: async function(){
   let PatientManagementInstance;
   const loader = $("#loader");
   const content = $("#content");


   loader.show();
   content.hide();
  
   // load account data
   if (window.ethereum) {
     try {
       // recommended approach to requesting user to connect mmetamask instead of directly getting the accounts
       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
       App.account = accounts;
       $("#accountAddress").html("Your Account: " + App.account);
     } catch (error) {
       if (error.code === 4001) {
         // User rejected request
         console.warn('user rejected')
       }
       $("#accountAddress").html("Your Account: Not Connected");
       console.error(error);
     }
   }


   //load contract ddata
   App.contracts.PatientManagement.deployed()
   .then( function( instance ){
     PatientManagementInstance = instance;


     return PatientManagementInstance.patientsCount();
   }) 
   .then( function( patientsCount ){
     var patientsResults = $("#patientsResults");
     patientsResults.empty();


     var patientsSelect = $("#patientsSelect");
     patientsSelect.empty();

     


 // Define the showAlert function
function showAlert() {
  alert("Vaccine Certificate Downloaded!");
}

// Loop through patients
for (let i = 1; i <= patientsCount; i++) {
  PatientManagementInstance.patients(i)
      .then(function(patient) {
          console.log(patient);
          var id = patient[0];
          var name = patient[1];
          var age = patient[2];
          var vaccine_status = patient[4];
          var death = patient[7];
          var district = patient[5];
          var isDoubleDosed = patient[8]; // Assuming this indicates whether the patient is double dosed or not

          // Check if the patient is double dosed
          var btn = "";
          if (isDoubleDosed == true) {
              btn = "<button class='btn btn-primary' data-id='" + id + "'>Certificate</button>";
          }

          // Create a button element
          var button = $(btn);

          // Attach click event listener to the button
          button.on('click', function() {
              showAlert();
          });

          // Create table row and append it to the table body
          var patientTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + age + "</td><td>" + district + "</td><td>" + vaccine_status + "</td><td>" + death + "</td><td></td></tr>";
          var tableRow = $(patientTemplate);
          tableRow.find('td').last().append(button);
          patientsResults.append(tableRow);
      
      
    


         //render balloot option
         let patientOption = "<option value=" + id +  ">" + name + "</option>"
         patientsSelect.append( patientOption )
       });
     }
     return PatientManagementInstance.admins(  App.account )
   })
   .then( function( isAdmin ){
     // don't allow user to vote
     if(isAdmin){
     $( "#Adminform" ).hide()
     $( "#addPatientform" ).hide()
     }
     loader.hide();
     content.show();
   })
   .catch( function( error ){
     console.warn( error )
   });
   
       App.contracts.PatientManagement.deployed().then(function(instance) {
        return instance.getCovidTrend();
    }).then(function(result) {
        $("#covidTrendResults").html(
            "<tr><td>" + result[1] + "</td><td>" + result[0] + "</td><td>" + result[2] + "</td><td>" + result[3] + "</td><td>" + result[4] + "</td><td>" + result[5] + "</td><td>" + result[6] + "</td></tr>"
        );
    }).catch(function(err) {
        console.error(err);
    });


    
    

// Fetch district death counts
App.contracts.PatientManagement.deployed()
.then(function(instance) {
    return instance.getDistrictDeathCounts();
})
.then(function(result) {
    // Extract district names and death counts from the result
    console.log(result);
   
    var districts = result[0];
    var deathCounts = result[1];
    console.log(districts );
    console.log(deathCounts);
    // Update the UI with the district names and death counts
    var districtsList = document.getElementById("districtsList");
    for (var i = 0; i < districts.length; i++) {
        var listItem = document.createElement("li");
        listItem.textContent = districts[i] + ": " + deathCounts[i];
        districtsList.appendChild(listItem);
    }
})
.catch(function(error) {
    console.error("Error fetching district death counts:", error);
});


  
 },



 // casting vote
 castVote: function(){
   App.contracts.PatientManagement.deployed()
   .then( function( instance ){
     return instance.makeAdmin(1,{ from: App.account[0] } )
   })
   .then( function( result ){
     // wait for voters to update vote
     console.log({ result })
       // content.hide();
       // loader.show();
       alert("You are an admin")
       App.render()
   })
   .catch( function( err ){
     console.error( err )
   } )
 },
 
 addPatient: function() {
 let name= $("#nameInput").val();
  let age = $("#ageInput").val();
  let gender = $("#genderInput").val();
  let vaccineStatus = $("#vaccineStatusInput").val();
  let district = $("#districtInput").val();
  let symptoms = $("#symptomsInput").val();
  let isDead = $("#isDeadInput").val() === "true";

  App.contracts.PatientManagement.deployed()
  .then(function(instance) {
    return instance.addPatient(name, age, gender, vaccineStatus, district, symptoms, isDead, { from: App.account[0] });
  })
  .then(function(result) {
    // Success, do something
    console.log("Patient added successfully:", result);
    App.render()
    // Optionally, you can update the UI to reflect the addition of the patient
  })
  .catch(function(error) {
    // Handle errors
    console.error("Error adding patient:", error);
  });
  
},

updateVaccine: function() {
  let id = $("#updateVaccineId").val();
  let newVaccineStatus = $("#updateVaccineStatus").val();

  App.contracts.PatientManagement.deployed()
  .then(function(instance) {
    return instance.updateVaccine(id, newVaccineStatus, { from: App.account[0] });
  })
  .then(function(result) {
    console.log("Vaccine status updated successfully:", result);
    App.render();
  })
  .catch(function(error) {
    console.error("Error updating vaccine status:", error);
  });
},

updateDeath: function() {
  let id = $("#updateDeathId").val();
  let isDead = $("#updateDeathStatus").val() === "true";

  App.contracts.PatientManagement.deployed()
  .then(function(instance) {
    return instance.updateDeath(id, isDead, { from: App.account[0] });
  })
  .then(function(result) {
    console.log("Death status updated successfully:", result);
    App.render();
  })
  .catch(function(error) {
    console.error("Error updating death status:", error);
  });
  
  
},


 // voted event
 listenForEvents: function(){
   App.contracts.PatientManagement.deployed()
   .then( function( instance ){
     instance.votedEvent({}, {
       fromBlock: 0,
       toBlock: "latests"
     })
     .watch( function( err, event ){
       console.log("Triggered", event);
       // reload page
       App.render()
     })
   })
 },
 
listenForEvents: function() {
   App.contracts.PatientManagement.deployed()
   .then(function(instance) {
       // Get the contract instance
       const contractInstance = instance;

       // Subscribe to the PatientAdded event
       contractInstance.PatientAdded({}, function(error, event) {
           if (error) {
               console.error("Error listening for PatientAdded event:", error);
               return;
           }
           console.log("Patient Added:", event.returnValues);
           // Optionally, you can update the UI to reflect the addition of the patient
           // For example, you can append the new patient details to a table
           // or display a notification to the user
       });
   })
   .catch(function(error) {
       console.error("Error getting contract instance:", error);
   });
},

};


$(function() {
 $(window).load(function() {
   App.init();
 });
});

