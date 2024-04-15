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
     document.title = "Patient Management System";
   }
   else{
     $("#loader-msg").html('No metamask ethereum provider found')
     console.log('No Ethereum provider')
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
  
   if (window.ethereum) {
     try {
       
       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
       App.account = accounts;
       $("#accountAddress").html("Your Account: " + App.account);
     } catch (error) {
       if (error.code === 4001) {
         console.warn('user rejected')
       }
       $("#accountAddress").html("Your Account: Not Connected");
       console.error(error);
     }
   }


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

    //  for (let i = 1; i <= patientsCount; i++) {
    //   PatientManagementInstance.admins(i)
    //       .then(function(admin) {
    //           console.log(admin);
    //       })}

    // for (let i = 1; i <= patientsCount; i++) {
    //   PatientManagementInstance.admins(i)
    //       .then(function(admin) {
    //           console.log(admin);
    //           if (admin == true){
    //             var admin = "Admin"
    //           } else{
    //             var admin = "General"
    //           };
    //       })}


 
function showAlert() {
  alert("Vaccine Certificate Downloaded!");
}


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
          var isDoubleDosed = patient[8]; 
          var btn = "none";
          if (isDoubleDosed == true) {
              btn = "<button class='btn btn-primary' data-id='" + id + "'>Certificate</button>";
          }

          
          var button = $(btn);

          button.on('click', function() {
              showAlert();
          });

          
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
     if(isAdmin){
     $( "#Adminform" ).hide()
     $( "#addPatientform" ).hide()
     }else{
      $("#Vaccineform").hide()
      $("#DeathForm").hide()
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
      console.log(result)
        $("#covidTrendResults").html(
            "<tr><td>" + result[1] + "</td><td>" + result[0] + "</td><td>" + result[2] + "</td><td>" + result[3] + "</td><td>" + result[4] + "</td><td>" + result[5] + "</td><td>" + result[6] + "</td></tr>"
        );
    }).catch(function(err) {
        console.error(err);
    });


    
    


App.contracts.PatientManagement.deployed()
.then(function(instance) {
    return instance.getDistrictDeathCounts();
})
// .then(function(result) {
//     // Extract district names and death counts from the result
//     console.log(result);
   
//     var districts = result[0];
//     var deathCounts = result[1];
//     console.log(districts );
//     console.log(deathCounts);
//     // Update the UI with the district names and death counts
//     var districtsList = document.getElementById("districtsList");
//     for (var i = 0; i < districts.length; i++) {
//         var listItem = document.createElement("li");
//         listItem.textContent = districts[i] + ": " + deathCounts[i];
//         districtsList.appendChild(listItem);
//     }
// })
// .catch(function(error) {
//     console.error("Error fetching district death counts:", error);
// });


  
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
    console.log("Patient added successfully:", result);
    App.render()
  })
  .catch(function(error) {
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



 listenForEvents: function(){
   App.contracts.PatientManagement.deployed()
   .then( function( instance ){
     instance.votedEvent({}, {
       fromBlock: 0,
       toBlock: "latests"
     })
     .watch( function( err, event ){
       console.log("Triggered", event);
       App.render()
     })
   })
 },
 
listenForEvents: function() {
   App.contracts.PatientManagement.deployed()
   .then(function(instance) {
       const contractInstance = instance;

       contractInstance.PatientAdded({}, function(error, event) {
           if (error) {
               console.error("Error listening for PatientAdded event:", error);
               return;
           }
           console.log("Patient Added:", event.returnValues);
          
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

