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
   
// Structure to hold district-wise patient statistics
    struct DistrictStats {
        uint totalPatients;
        uint totalDeaths;
        uint totalAge;
        uint childCount;
        uint teenCount;
        uint youthCount;
        uint elderCount;
    }

    // Mapping to store district-wise statistics
    mapping(string => DistrictStats) public districtStats;

    // Function to update Covid trend statistics
    function updateCovidTrend(uint _id, uint _age, string memory _district, bool _is_dead, bool isAddition) internal {
        DistrictStats storage stats = districtStats[_district];
        
        // Increment or decrement totalPatients
        if (isAddition) {
            stats.totalPatients++;
        } else {
            require(stats.totalPatients > 0, "No patients in this district");
            stats.totalPatients--;
        }
        
        // Update totalAge
        stats.totalAge += _age;

        // Update death count
        if (_is_dead) {
            stats.totalDeaths++;
        }

        // Update age group counts
        if (_age < 13) {
            stats.childCount++;
        } else if (_age < 20) {
            stats.teenCount++;
        } else if (_age < 50) {
            stats.youthCount++;
        } else {
            stats.elderCount++;
        }
    }
   
   
   
   
   
   
   

   // adding candidates
   function addPatient(string memory _name, uint _age ,string memory _gender,string memory _vaccine_status,string memory _district,string memory _symptoms_details,bool _is_dead) public {
       patientsCount++;
       patients[patientsCount] = Patient(patientsCount, _name,_age, _gender, _vaccine_status, _district, _symptoms_details, _is_dead);
       emit PatientAdded(patientsCount, _name, _age, _gender, _vaccine_status, _district, _symptoms_details, _is_dead);
       
        // Update Covid trend statistics
        updateCovidTrend(patientsCount, _age, _district, _is_dead, true);
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
    require(admins[msg.sender] == true, "Sender is not an Admin");
    _;
  }
  
     function updateVaccine(uint _id, string memory _vaccine_status) public senderIsAdmin {
   
       patients[_id].vaccine_status = _vaccine_status;
       
   }
   
   
   
   
   
   
   
   
function updateDeath(uint _id, bool _is_dead) public senderIsAdmin {
        bool currentDeathStatus = patients[_id].is_dead;
        
        // Update patient death status
        patients[_id].is_dead = _is_dead;
        
        // Update Covid trend statistics only if death status changes
        if (currentDeathStatus != _is_dead) {
            updateCovidTrend(_id, patients[_id].age, patients[_id].district, _is_dead, !_is_dead);
        }
    }
    
    
    
    // Function to get Covid trend statistics
    function getCovidTrend() public view returns (uint, string memory, uint, uint, uint, uint, uint) {
        uint totalPatients;
        uint totalDeaths;
        uint medianAge;
        uint childPercent;
        uint teenPercent;
        uint youthPercent;
        uint elderPercent;

        // Calculate combined totalPatients and totalDeaths across all districts
        for (uint i = 1; i <= patientsCount; i++) {
            totalPatients++;
            if (patients[i].is_dead) {
                totalDeaths++;
            }
        }

        // Calculate median age
        uint[] memory ages = new uint[](totalPatients);
        uint idx = 0;
        for (uint i = 1; i <= patientsCount; i++) {
            ages[idx] = patients[i].age;
            idx++;
        }
        medianAge = calculateMedian(ages);

        // Calculate percentage of age groups
        childPercent = (districtStats["Total"].childCount * 100) / totalPatients;
        teenPercent = (districtStats["Total"].teenCount * 100) / totalPatients;
        youthPercent = (districtStats["Total"].youthCount * 100) / totalPatients;
        elderPercent = (districtStats["Total"].elderCount * 100) / totalPatients;

        return (totalDeaths, "Total", medianAge, childPercent, teenPercent, youthPercent, elderPercent);
    }

    // Function to calculate median
    function calculateMedian(uint[] memory values) internal pure returns (uint) {
        uint n = values.length;
        require(n > 0, "Empty array");
        if (n % 2 == 0) {
            return (values[n / 2 - 1] + values[n / 2]) / 2;
        } else {
            return values[n / 2];
        }
    }

}

