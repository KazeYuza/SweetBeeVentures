document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const selected = params.get('selected');
    const amount = params.get('amount');
    const address = params.get('address');
    const prize = params.get('prize');
    const deliveryCost = Number(params.get('delivery'));
    const final = Number(params.get('total'));
    const flag = params.get('flag');

    if (flag === 'true') {
        if (selected && amount && address && prize && deliveryCost && final) {
            document.getElementById("selected").textContent = `- ${selected} x ${amount}`;
            document.getElementById("delivery").textContent = `Delivery Address: ${address}`;
            document.getElementById("subtotal").textContent = `Subtotal: R${prize * amount}`;
            document.getElementById("cost").textContent = `Delivery: R${deliveryCost.toFixed(2)}`;
            document.getElementById("total").textContent = `Total: R${final.toFixed(2)}`;
        } else {
            console.error("Value not found in the URL parameters.");
        }
    } else {
        document.getElementById("selected").textContent = `- ${selected} x ${amount}`;
        document.getElementById("delivery").textContent = `Delivery Address: None`;
        document.getElementById("subtotal").textContent = `Subtotal: R${prize * amount}`;
        document.getElementById("cost").textContent = `Delivery: R0.00`;
        document.getElementById("total").textContent = `Total: R${prize * amount}`;
    }
});



document.getElementById("payMent").addEventListener("submit", function(event) {
    event.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const bucketSize = params.get('selected');
    const amount = params.get('amount');
    const prize = params.get('prize');
    const total = amount * prize;
    let flagA = false;

    if (flagA === false) {
	    const name = document.getElementById("cardName").value.trim();
        const cardNum = document.getElementById("cardNum").value.trim();
        const expiry = document.getElementById("experationDate").value.trim();
        const cvv = document.getElementById("cvv").value.trim();

        if (!name) {
            document.getElementById("error-message").textContent = "Name is required.";
            return;
        }

        const cardNumberPattern = /^\d{16}$/;
        if (!cardNumberPattern.test(cardNum)) {
            document.getElementById("error-message").textContent = "Card number must be 16 digits.";
            return;
        }

        const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryPattern.test(expiry)) {
	    document.getElementById("error-message").textContent = "Invalid expiration date format.";
	    return;
        }

        const cvvPattern = /^\d{3}$/;
        if (!cvvPattern.test(cvv)) {
	    document.getElementById("error-message").textContent = "CVV must be 3 digits.";
	    return;
        }

	    flagA = true;

        const paymentData = {
	    name: name,
	    cardNumber: cardNum,
	    expiry: expiry,
	    cvv: cvv,
	    total: total
        };
        
        //Simulated backend submission using Fetch API
        fetch("/process_payment", { //The endpoint that handels payments
	    method: "POST",
	    headers: {
	        "Content-Type": "application/json"
	    },
	    body: JSON.stringify(paymentData)
        })
        .then(response => {
	    if (response.ok) {
 	        //Payment successful, redirect to a confirmation page or show a success message
	        window.location.href = "payment_success.html";
	    } else {
	        //Payment failed show an error message
    	    response.json().then(data => {
		        document.getElementById("error-message").textContent = data.error || "Payment faild.";
	        });
	    }
        })
        .catch(error => {
	        document.getElementById("error-message").textContent = `an error occurred: ${error.message}`;
        });
    }

    if (flagA === true) {
	    updateStock(bucketSize, amount);
        document.getElementById("error-message").textContent = `The transaction was succesful.`
    }   
});

function updateStock(bucketSize, amount) {
    try {
        const stockData = JSON.parse(localStorage.getItem('stockData'));
        if (!stockData || typeof stockData !== 'object') {
            throw new Error('Invalid or missing stock data in localStorage');
        }
        if (!(bucketSize in stockData)) {
            throw new Error(`Bucket size '${bucketSize}' not found in stock data`);
        }
        if (typeof stockData[bucketSize] !== 'number') {
            throw new Error(`Invalid quantity for bucket size '${bucketSize}'`);
        }
        stockData[bucketSize] -= amount;
        localStorage.setItem('stockData', JSON.stringify(stockData));
    } catch (error) {
        console.error('Error updating stock data:', error);
    }    
}