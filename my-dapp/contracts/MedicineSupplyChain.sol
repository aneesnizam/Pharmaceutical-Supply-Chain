// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract MedicineSupplyChain {
    struct Medicine {
        uint id;
        string name;
        address manufacturer;
        address distributor;
        address retailer;
        address customer;
    }

    mapping(uint => Medicine) public medicines;
    uint public medicineCount;

    event MedicineCreated(uint id, string name, address manufacturer);
    event MedicineSupplied(uint id, address distributor);
    event MedicineDistributed(uint id, address retailer);
    event MedicineSold(uint id, address customer);

    // Create Medicine
    function createMedicine(string memory _name) public {
        medicineCount++;
        medicines[medicineCount] = Medicine(medicineCount, _name, msg.sender, address(0), address(0), address(0));
        emit MedicineCreated(medicineCount, _name, msg.sender);
    }

    // Supply Medicine to Distributor
    function supplyMedicine(uint _id, address _distributor) public {
        require(medicines[_id].manufacturer == msg.sender, "Only manufacturer can supply");
        require(medicines[_id].distributor == address(0), "Already supplied");
        medicines[_id].distributor = _distributor;
        emit MedicineSupplied(_id, _distributor);
    }

    // Distribute Medicine to Retailer
    function distributeMedicine(uint _id, address _retailer) public {
        require(medicines[_id].distributor == msg.sender, "Only distributor can distribute");
        require(medicines[_id].retailer == address(0), "Already distributed");
        medicines[_id].retailer = _retailer;
        emit MedicineDistributed(_id, _retailer);
    }

    // Sell Medicine to Customer
    function sellMedicine(uint _id, address _customer) public {
        require(medicines[_id].retailer == msg.sender, "Only retailer can sell");
        require(medicines[_id].customer == address(0), "Already sold");
        medicines[_id].customer = _customer;
        emit MedicineSold(_id, _customer);
    }
}
