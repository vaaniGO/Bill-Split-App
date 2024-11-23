import React, { useState } from "react";
import { AvatarGenerator } from 'random-avatar-generator';
import "./App.css";
import "./checkbox.css";
import binIcon from './assets/bin.png';
import pizzaIcon from './assets/food-icons/pizza.png'
import billIcon from './assets/bill.png'
import hamburgerIcon from './assets/food-icons/hamburger.png'
import foodIcon1 from './assets/food-icons/pizza-e-fichi.png'
import vegetableIcon from './assets/food-icons/vegetable.png'
import bunIcon from './assets/food-icons/buns.png'
import friedEddIcon from './assets/food-icons/fried-egg.png'
import lobsterIcon from './assets/food-icons/lobster.png'
import pomegranteIcon from './assets/food-icons/pomegranate.png'
import spaghettiIcon from './assets/food-icons/spaghetti.png'
import tendonIcon from './assets/food-icons/tendon.png'

const foodIcons = [pizzaIcon, hamburgerIcon, foodIcon1, vegetableIcon, bunIcon, friedEddIcon, lobsterIcon, pomegranteIcon, spaghettiIcon, tendonIcon]

function App() {
  const [people, setPeople] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [billSplit, setBillSplit] = useState({});
  const [dishAssignments, setDishAssignments] = useState({});
  const [owingRecords, setOwingRecords] = useState([]);
  const [splitMessage, setSplitMessage] = useState("");
  const [isCalculationDone, setIsCalculationDone] = useState(false);
  const generator = new AvatarGenerator();

  const handleAddPerson = () => {
    setPeople([...people, { name: "", avatar: generator.generateRandomAvatar()}]);
  };

  const handleAddDish = () => {
    setDishes([...dishes, { name: "", units: 0, price: 0, foodIcon: foodIcons[Math.floor(Math.random()*10)]}]);
  };

  const handleDishChange = (index, key, value) => {
    const updatedDishes = [...dishes];
    updatedDishes[index][key] = value;
    setDishes(updatedDishes);
  };

  const handleNameChange = (index, value) => {
    const updatedPeople = [...people];
    updatedPeople[index].name = value;
    setPeople(updatedPeople);
  };

  // perform a 'splitwise'-like function to clear up records.
  const cleanUpOwingRecords = () => {
    const cleanedRecords = [...owingRecords]; // Create a copy to work with
  
    for (let i = 0; i < cleanedRecords.length; i++) {
      const tempTo = cleanedRecords[i].to; // Store the name of 'to' in temp
      let amount1 = cleanedRecords[i].amount;
  
      for (let j = 0; j < cleanedRecords.length; j++) {
        if (i !== j && cleanedRecords[j].from === tempTo) {
          let amount2 = cleanedRecords[j].amount; // Use the amount, not the object
  
          // Convert to numbers if needed
          amount1 = Number(amount1) || 0;
          amount2 = Number(amount2) || 0;
          // handle same name switched case
          if (cleanedRecords[i].to === cleanedRecords[j].from && cleanedRecords[i].from === cleanedRecords[j].to) {
            if (amount1 > amount2) {
              cleanedRecords[i].amount = amount1-amount2;
              cleanedRecords.splice(j, 1);
            }
            else if (amount2 > amount1) {
              cleanedRecords[j].amount = amount2-amount1;
              cleanedRecords.splice(i, 1);
            }
            else {
              cleanedRecords.splice(j, 1);
              cleanedRecords.splice(i, 1);
            }
          }
          else 
          {// handle amount concatenation error  
          if (amount2 < amount1) {
            cleanedRecords[i].amount = amount2;
            cleanedRecords[j].from = cleanedRecords[i].from;
            cleanedRecords[j].amount = (amount1 - amount2); // Format to 2 decimal places if required
            j = 0;
          } else if (amount2 > amount1) {
            cleanedRecords[i].amount = amount1;
            cleanedRecords[i].to = cleanedRecords[j].to;
            cleanedRecords[j].amount = (amount2 - amount1); // Format to 2 decimal places if required
            j = 0;
          } else {
            cleanedRecords[i].amount = amount2;
            cleanedRecords[i].to = cleanedRecords[j].to;
            cleanedRecords[j].amount = 0;
            j = 0;
          }}
        }
      }
    }
    setOwingRecords(cleanedRecords); // Update the state with the cleaned records
  };

  const handleCalculateBill = () => {
    setSplitMessage("");
    const totalShares = {};
  
    // Initialize totalShares with zero for all people
    people.forEach((person) => {
      totalShares[person.name] = 0;
    });

    let perPersonShare = 0;

    // Calculate each person's share from the dishes
    dishes.forEach((dish) => {
      // Calculate the total price of the dish
      const totalDishPrice = dish.units * dish.price;
  
      // Find all the people who have ticked this dish
      const sharers = Object.keys(dishAssignments).filter(
        (personName) => dishAssignments[personName][dish.name]
      );
  
      // If there are no sharers, skip this dish
      if (sharers.length === 0) return;
  
      // Calculate the per-person share of this dish
      perPersonShare = totalDishPrice / sharers.length;
  
      // Add this share to each sharer's total
      sharers.forEach((personName) => {
        totalShares[personName] += perPersonShare;
      });
    });
    cleanUpOwingRecords();
    // Adjust totalShares based on owingRecords
    owingRecords.forEach(({ from, to, amount }) => {

      if (amount > perPersonShare) {
        // If the amount owed is greater than the pp share, example the pp share is 50 and the amt owed is 100
        totalShares[from] += perPersonShare;
        // then let the person cover the person's bill pp share, so the amount now owed is as follows:
        amount -= perPersonShare;
        totalShares[to] = 0;
      }
      totalShares[to] -= amount;
      // else the person who is owed the money now has to pay his share
      if (totalShares[to] < 0) {
        const newMessage = `${from} should additionally pay Rs. ${Math.abs(totalShares[to]).toFixed(2)} to ${to}.`;
        setSplitMessage((prevMessage) => 
          prevMessage ? `${prevMessage}\n${newMessage}` : newMessage
        );
        totalShares[to] = 0; 
      }
      else 
        totalShares[from] += amount;
    });
  
    // Update the state with the final calculated bill split
    setBillSplit(totalShares);
    setIsCalculationDone(true); // Mark the calculation as done
  };  

  const handleDeletePerson = (index) => {
    // Remove the person from the list
    const updatedPeople = people.filter((_, i) => i !== index);
    setPeople(updatedPeople);
  
    // Update the billSplit state to remove the deleted person's data
    const updatedBillSplit = { ...billSplit };
    delete updatedBillSplit[people[index].name];
    setBillSplit(updatedBillSplit);
  };
  
  const handleDeleteDish = (index) => {
    // Remove the person from the list
    const updatedDishes = dishes.filter((_, i) => i !== index);
    setDishes(updatedDishes);
  
    // Update the billSplit state to remove the deleted person's data
    const updatedBillSplit = { ...billSplit };
    delete updatedBillSplit[dishes[index].name];
    setBillSplit(updatedBillSplit);
  };

  // Function to render the table with checkboxes
  const handleDishAssignment = () => {
    setIsCalculationDone(true);
    const assignments = {};
    people.forEach((person) => {
      assignments[person.name] = {};
      dishes.forEach((dish) => {
        assignments[person.name][dish.name] = false; // Initialize all cells as unchecked
      });
    });
    setDishAssignments(assignments);
  }; 

  const handleCheckboxChange = (personName, dishName) => {
    setDishAssignments((prevAssignments) => ({
      ...prevAssignments,
      [personName]: {
        ...prevAssignments[personName],
        [dishName]: !prevAssignments[personName][dishName],
      },
    }));
  };

  // Owed refers to the person who is owed mnoney, owes points to the person who is to pay to the owed, and the amount refers to the amount
  // If the amount > pp share, then add a 'negative' provision as in the owes pays the owed in the bill clearing.
  const handleAddOwing = () => {
    setOwingRecords([...owingRecords, { from: "", to: "", amount: 0 }]);
  };
  
  const handleOwingChange = (index, field, value) => {
    const updatedRecords = [...owingRecords];
    updatedRecords[index][field] = value;
    setOwingRecords(updatedRecords);
  };
  
  const handleDeleteOwing = (index) => {
    const updatedRecords = owingRecords.filter((_, idx) => idx !== index);
    setOwingRecords(updatedRecords);
  };

  const handleAssignAll = () => {
    const assignments = {}; // Create a new object for assignments
    people.forEach((person) => {
      assignments[person.name] = {};
      dishes.forEach((dish) => {
        assignments[person.name][dish.name] = true; // Set all checkboxes to true
      });
    });
    setDishAssignments(assignments); // Update the state with the new assignments
  };  

  return (
    <div className="app">
      <img src={billIcon}></img>
      <h1>Bill Splitter</h1>
      <h4>This web-app allows a group of people to enter complicated details while splitting a bill, 
        including who all ate what and any previous debt records,
         to conveniently settle everything in one go without doing any tedious math. Simply enter the details as directed!</h4>
      <div className="section">
        <h2>People</h2>
        <h6>Add all the people on the table.</h6>
        {people.map((person, index) => (
          <div key={index} className="person">
            <input
              type="text"
              placeholder="Enter Name"
              value={person.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
            />
            <div class="icons">
            <img src={person.avatar} alt="Avatar" />
            <img
              src= {binIcon}
              alt="Delete"
              className="delete-icon"
              onClick={() => handleDeletePerson(index)}
            />
            </div>
          </div>
        ))}
        <button onClick={handleAddPerson} disabled={isCalculationDone} className="button comic-button">Add Person</button>
      </div>

      <div className="section">
        <h2>Dishes</h2>
        <h6>Add all the dishes ordered.</h6>
        {dishes.map((dish, index) => (
          <div key={index} className="dish">
            <div class="dishInput">
              <h5>Dish name/no.</h5>
            <input
              type="text"
              placeholder="Dish Name"
              value={dish.name}
              onChange={(e) => handleDishChange(index, "name", e.target.value)}
            />
            </div>
            <div class="dishInput">
              <h5>No. of units</h5>
            <input
              type="number"
              placeholder="Units"
              value={dish.units}
              onChange={(e) => handleDishChange(index, "units", parseInt(e.target.value))}
            />
            </div>
            <div class="dishInput">
              <h5>Price per unit</h5>
            <input
              type="number"
              placeholder="Price per Unit"
              value={dish.price}
              onChange={(e) => handleDishChange(index, "price", parseFloat(e.target.value))}
            />
            </div>
            <div class="icons">
            <img src={dish.foodIcon} alt="Dish" />
            <img
              src= {binIcon}
              alt="Delete"
              className="delete-icon"
              onClick={() => handleDeleteDish(index)}
            />
            </div>
          </div>
        ))}
        <button onClick={handleAddDish} disabled={isCalculationDone} className="button comic-button">Add Dish</button>
      </div>

        <div className="section">
          <h2>Specify Owing</h2>
          <h6>Add money owed between pairs of people.</h6>
          {owingRecords.map((record, index) => (
            <div key={index} className="owing-record">
              <select
                value={record.from}
                onChange={(e) => handleOwingChange(index, "from", e.target.value)}
              >
                <option value="" disabled>Select Person</option>
                {people.map((person, idx) => (
                  <option key={idx} value={person.name}>
                    {person.name}
                  </option>
                ))}
              </select>
              <span> owes </span>
              <select
                value={record.to}
                onChange={(e) => handleOwingChange(index, "to", e.target.value)}
              >
                <option value="" disabled>Select Person</option>
                {people
                  .filter((p) => p.name !== record.from)
                  .map((person, idx) => (
                    <option key={idx} value={person.name}>
                      {person.name}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={record.amount}
                onChange={(e) =>
                  handleOwingChange(index, "amount", parseFloat(e.target.value))
                }
              />
              <div className="icons">
              <img
                src={binIcon}
                alt="Delete"
                className="delete-icon"
                onClick={() => handleDeleteOwing(index)}
              />
              </div>
            </div>
          ))}
          <button onClick={handleAddOwing} disabled={isCalculationDone} className="button comic-button">Add Record</button>
        </div>


      <button onClick={handleDishAssignment} className="calculate-btn comic-button">
        Finalise and assign people to dishes
      </button>
      <h6>Once you finalise, you will not be able to edit your people / dishes /  debt records.</h6>

      {Object.keys(dishAssignments).length > 0 && (
          <div className="section">
            <h2>Assign Dishes</h2>
            <h6>Check a box where the correspnding person took a share of the corresponding dish.</h6>
            <button className="button comic-button assign-all-btn" onClick={ handleAssignAll }>Assign all</button>
            <div class="table-container">
            <table class="DishTable">
              <thead>
                <tr>
                  <th>Dish</th>
                  {people.map((person, index) => (
                    <th key={index}>{person.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish, dishIndex) => (
                  <tr key={dishIndex}>
                    <td>{dish.name}</td>
                    {people.map((person, personIndex) => (
                      <td key={personIndex}>
                        <label class="input-checkbox-container">
                          <input type="checkbox" 
                          checked={dishAssignments[person.name][dish.name]}
                          onChange={() =>
                            handleCheckboxChange(person.name, dish.name)
                          }/>
                          <div class="checkmark"></div>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

      <button onClick={handleCalculateBill} className="calculate-btn comic-button" disabled={!isCalculationDone}>
        Get individual contributions
      </button>
      <div className="section">
        <h2>Bill Split</h2>
        <h6>Final amounts appear here.</h6>
        {Object.entries(billSplit).map(([person, share]) => (
          <div key={person}>
            {person}: Rs. {share}
          </div>
        ))}
        <div className="split-message">
          {splitMessage && <pre>{splitMessage}</pre>}
        </div>
      </div>
      <div className = "footer">
        Made by Vaani Goenka 2024
      </div>
    </div>
  );
}

export default App;
