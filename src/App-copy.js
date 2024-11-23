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
    const [billSplit, setBillSplit] = useState([]);
    const [dishAssignments, setDishAssignments] = useState([]);
    const generator = new AvatarGenerator();

    // Create a copy of the previous people array and use the set People function to add a new person with the given specifications
    const handleAddPerson = () => {
        setPeople([...people, {name: "", avatar: generator.generateRandomAvatar()}]);
    };

    // Same work is being done for adding a dish to the dishes array
    const handleAddDish = () => {
        setDishes([...dishes, {name: "", units: 0, price: 0, foodIcon: foodIcons[Math.floor(Math.random()*10)]}]);
    };

    // To change dishes (i.e. when a person actaully types the dish into the input field) 
    // We updateDishes again after making a copy of the previous array, then setting the value at the given index and key
    const handleDishChange = (index, key, value) => {
        const updatedDishes = [...dishes];
        updatedDishes[index][key] = value;
        setDishes(updatedDishes);
    };

    // Same work is being done for name changes (name inputs)
    const handleNameChange = (index, key, value) => {
        const updatedPeople = [...people];
        updatedPeople[index][key] = value;
        setPeople(updatedPeople);
    };

    // To delete a person from the people array, we simply filter on the basis of index
    // In accordance with this, we update the billSplit by removing that person from the table and billSplit
    const handleDeletePerson = (index) => {
        const updatedPeope = people.filter((_, i) => i !== index);
        setPeople(updatedPeope);

        const updatedBillSplit = { ...billSplit };
        delete updatedBillSplit[people[index].name];
        setBillSplit(updatedBillSplit);
    };

    // Same work is being done for deleting a dish
    const handleDeleteDish = (index) => {
        const updatedDishes = dishes.filter((_, i) => i !== index);
        setDishes(updatedDishes);

        const updatedBillSplit = { ...billSplit };
        delete updatedBillSplit[dishes[index].name];
        setBillSplit(updatedBillSplit);
    };

    const handleDishAssignment = () => {
        const assignments = {};
        people.forEach((person) => {
            // The line below creates an empty key for each person, and the key in-turn is an array that will be populated.
            assignments[person.name] = {};
            dishes.forEach((dish) => {
                assignments[person.name][dish.name] = false;
            });
        });
        setDishAssignments(assignments);
    };
    
    const handleCheckboxChange = (personName, dishName) => {
        setDishAssignments((prevAssignments) => ({
            ...prevAssignments,
            [personName] : {
                ...prevAssignments[personName],
                [dishName] : !prevAssignments[personName][dishName],
            },
        }));
    };

    const handleCalculateBill = () => {
        const totalShares = {};

        people.forEach((person) => {
            totalShares[person.name] = 0;
        });

        dishes.forEach((dish) => {
            const totalDishPrice = dish.units * dish.price;

            const sharers = Object.keys(dishAssignments).filter(
                (personName) => dishAssignments[personName][dish.name]
            );

            if (sharers.lenght === 0) return; 

            const perPersonShare = totalDishPrice / sharers.length; 

            sharers.forEach((personName) => {
                totalShares[personName] += perPersonShare;
            });
        });

        setBillSplit(totalShares);
    };

}
