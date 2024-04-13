// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract PatientManagement {

   event votedEvent(uint indexed _candidateId);
   event PatientAdded(
       uint indexed id,
       string name,
       uint age,
       string gender,
       string vaccine_status,
       string district,
       string symptoms_details,
       bool is_dead
   );

   // model a candidate
   struct Patient{
       uint id;
       string name;
       uint age;
       string gender;
       string vaccine_status;
       string district;
       string symptoms_details;
       bool is_dead;
   }

   // Store accounts that have voted
   mapping( address => bool ) public admins;

   mapping( uint => Patient ) public patients;

   // store candidates count
   uint public patientsCount=0;

   // adding candidates
   function addPatient(string memory _name, uint _age ,string memory _gender,string memory _vaccine_status,string memory _district,string memory _symptoms_details,bool _is_dead) public {
       patientsCount++;
       patients[patientsCount] = Patient(patientsCount, _name,_age, _gender, _vaccine_status, _district, _symptoms_details, _is_dead);
       emit PatientAdded(patientsCount, _name, _age, _gender, _vaccine_status, _district, _symptoms_details, _is_dead);
   }

   // cast vote
   function makeAdmin(uint _candidateId) public {
       // require that the current voter haven't voted before
       require(!admins[msg.sender]);
       /// emit the event
       emit votedEvent(_candidateId);

       // record voters vote
       admins[msg.sender] = true;
   }
   
     modifier senderIsAdmin {
    require(admins[msg.sender] == true, "Sender is not a doctor");
    _;
  }
  
     function updateVaccine(uint _id, string memory _vaccine_status) public senderIsAdmin {
   
       patients[_id].vaccine_status = _vaccine_status;
       
   }
        function updateDeath(uint _id, bool _is_dead) public senderIsAdmin {
   
       patients[_id].is_dead = _is_dead;
       
   }

}

