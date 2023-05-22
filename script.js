"use strict";

class BudgetApp {
  constructor() {
    this.url = "https://api.jsonbin.io/v3/b/646246ca8e4aa6225e9d8d79";
    this.data = {}; //data will fetch from jsonbin.io
  }

  async fetchData() {
    try {
      const response = await fetch(this.url);
      const jsonData = await response.json();
      const objData = jsonData.record.record[0];
      return objData;
    } catch (error) {
      throw new Error("Failed to fetch data");
    }
  }

  async setBudget() {
    const budget = document.getElementById("initial-budget");
    if (budget.value <= 0) {
      alert("Please enter a valid budget");
    } else {
      try {
        const dataToUpdate = { ...this.data };
        dataToUpdate.budget += Number(budget.value);
        dataToUpdate.inventory += Number(budget.value);
        await this.saveAndUpdateUI(dataToUpdate);
      } catch (error) {
        alert(error.message);
      }
    }
    budget.value = "";
  }

  updateUi() {
    const intialBudget = document.getElementById("budget");
    const inventory = document.getElementById("inventory");
    const totalCost = document.getElementById("cost");
    const costsBox = document.getElementById("costsBox");
    totalCost.innerHTML = `${this.data.totalCost.toString()}$`;
    inventory.innerHTML = `${this.data.inventory.toString()}$`;
    intialBudget.innerHTML = `${this.data.budget.toString()}$`;
    const items = this.data.costs.map((item, id) => {
      return `<div class="hstack" key="${id}">
              <div class="col-4 ps-5 mt-2">
                <button type="button" class="btn btn-link" onclick="budgetApp.deleteElement(${id})">
                  <i class="fa-solid fa-trash text-danger"></i>
                </button>
              </div>
              <div class="col-4 mt-2 text-primary">${item.amount}$</div>
              <div class="col-4 mt-2 text-primary fs-6">${item.topic}</div>
            </div>`;
    });
    costsBox.innerHTML = items.join("");
  }

  async addCost() {
    const costAmount = document.querySelector(".amount");
    const costTopic = document.querySelector(".topic");
    if (
      costAmount.value > this.data.inventory ||
      this.data.inventory === 0 ||
      costAmount.value <= 0
    )
      alert("You don't have enough money");
    else {
      try {
        const dataToUpdate = { ...this.data };
        this.addCostToData(dataToUpdate, costAmount, costTopic);
        await this.saveAndUpdateUI(dataToUpdate);
      } catch (error) {
        alert(error.message);
      }
    }
  }

  addCostToData(dataToUpdate, costAmount, costTopic) {
    dataToUpdate.costs.push({
      amount: Number(costAmount.value),
      topic: costTopic.value,
    });
    dataToUpdate.totalCost += Number(costAmount.value);
    dataToUpdate.inventory -= Number(costAmount.value);
    costAmount.value = costTopic.value = "";
  }

  async deleteElement(id) {
    try {
      const dataToUpdate = { ...this.data };
      dataToUpdate.totalCost -= dataToUpdate.costs[id].amount;
      dataToUpdate.inventory += dataToUpdate.costs[id].amount;
      dataToUpdate.costs = dataToUpdate.costs.filter(
        (_item, index) => index !== id
      );
      await this.saveAndUpdateUI(dataToUpdate);
    } catch (error) {
      alert(error.message);
    }
  }

  async resetData() {
    try {
      let dataToUpdate = { ...this.data };
      dataToUpdate = {
        budget: 0,
        totalCost: 0,
        inventory: 0,
        costs: [],
      };
      await this.saveAndUpdateUI(dataToUpdate);
    } catch (error) {
      alert(error.message);
    }
  }

  async saveDatatoDB(dataToUpdate) {
    try {
      const response = await fetch(this.url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key":
            "$2b$10$Ssp92u5INNuUzgyAxtjrHuAP120gLrissEQqIFUCJbumQjsShnc0a",
        },
        body: JSON.stringify({
          record: [dataToUpdate],
          metadata: { id: "646246ca8e4aa6225e9d8d79" },
        }),
      });
      this.data = { ...dataToUpdate }; // if data is saved to database then update data
    } catch (error) {
      throw new Error("Failed to save data");
    }
  }

  async saveAndUpdateUI(dataToUpdate) {
    try {
      await this.saveDatatoDB(dataToUpdate);
      this.updateUi();
    } catch (error) {
      throw error;
    }
  }

  async initialize() {
    try {
      this.data = await this.fetchData();
      this.updateUi();
    } catch (error) {
      alert(error.message);
    }
  }
}

const budgetApp = new BudgetApp();
budgetApp.initialize();
