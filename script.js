function formatCurrency(value) {
    if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)} Cr`; // Crores
    } else if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)} L`; // Lakhs
    } else {
        return `₹${value.toLocaleString()}`; // Thousands
    }
}

function calculateDCF() {
    // Fetch input values
    const price = parseFloat(document.getElementById("price").value);
    const priceUnit = parseFloat(document.getElementById("priceUnit").value);
    const rent = parseFloat(document.getElementById("rent").value);
    const maintenance = parseFloat(document.getElementById("maintenance").value);
    const taxRate = parseFloat(document.getElementById("taxRate").value) / 100; // Convert percentage to decimal
    const discountRate = parseFloat(document.getElementById("discountRate").value) / 100; // Convert percentage to decimal
    const holdingPeriod = parseInt(document.getElementById("holdingPeriod").value);
    const appreciationRate = parseFloat(document.getElementById("appreciationRate").value) / 100;
    const scenario = document.getElementById("scenario").value;

    // Validate inputs
    if (isNaN(price) || isNaN(rent) || isNaN(maintenance) || isNaN(taxRate) ||
        isNaN(discountRate) || isNaN(holdingPeriod) || isNaN(appreciationRate)) {
        document.getElementById("result").innerHTML = "Please fill all fields with valid numbers.";
        return;
    }

    // Adjust inputs for units
    const adjustedPrice = price * priceUnit;
    const adjustedRent = rent * 12; // Convert monthly rent to annual rent
    const adjustedMaintenance = maintenance * 12; // Convert monthly maintenance to annual maintenance

    // Calculate net rent based on scenario
    let netRentAfterTax = 0;
    if (scenario === "rents") {
        const taxableIncome = (adjustedRent - adjustedMaintenance) * (1 - 0.30); // 30% standard deduction
        const taxPayable = taxableIncome * taxRate;
        netRentAfterTax = adjustedRent - adjustedMaintenance - taxPayable;
    } else if (scenario === "owner") {
        netRentAfterTax = adjustedRent - adjustedMaintenance; // Treat saved rent as equivalent income
    }

    // Calculate present value of rental income
    let pvRent = 0;
    for (let n = 1; n <= holdingPeriod; n++) {
        pvRent += netRentAfterTax / Math.pow(1 + discountRate, n);
    }

    // Calculate future sale price
    const futureSalePrice = adjustedPrice * Math.pow(1 + appreciationRate, holdingPeriod);
    const pvSale = futureSalePrice / Math.pow(1 + discountRate, holdingPeriod);

    // Total present value
    const totalPV = pvRent + pvSale;

    // Determine if overpaying or underpaying
    const difference = totalPV - adjustedPrice;
    const verdict = difference >= 0 ? "Undervalued" : "Overvalued";

    // Display result
    document.getElementById("result").innerHTML = `
        <p><strong>Asking Price:</strong> ${formatCurrency(adjustedPrice)}</p>
        <p><strong>Total Present Value:</strong> ${formatCurrency(totalPV)}</p>
        <p>
            <strong>Difference:</strong> 
            <span class="${difference >= 0 ? 'underpay' : 'overpay'}">
                ${formatCurrency(Math.abs(difference))} (${verdict})
            </span>
        </p>
    `;
}