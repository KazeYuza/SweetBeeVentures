document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("Checkout").disabled = true;
})



let cost;
let flag;
let final;
let prize;
let loCation;
let quantity;
let selected;

document.getElementById("buyForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const bucketSize = document.getElementsByName("bucket-size");

    for (let i = 0; i < bucketSize.length; i++) {
        if (bucketSize[i].checked) {
            selected = bucketSize[i].value;
            if (i === 0) {
                prize = 30;
            } else if (i === 1) {
                prize = 50;
            } else if (i === 2) {
                prize = 70.50;
            } else if (i === 3) {
                prize = 100;
            } else if (i === 4) {
                prize = 150.50;
            } else if (i === 5) {
                prize = 200;
            }
            break;
        }
    }
    const amount = Number(document.getElementById("quantity").value);
    quantity = amount;
        
    if (document.getElementById("location").value === "") {
        document.getElementById("subtotal").textContent = `Subtotal: R${amount * prize}`;
        document.getElementById("delivery").innerText = "Delivery: No delivery destination.";
        document.getElementById("total").textContent = `Total: R${amount * prize}`;
        document.getElementById("Checkout").disabled = false;
        flag = false;
    } else {
        flag = true;
        showLoadingSpinner();
        fetchAPIKey(amount, prize);
    }
});

function fetchAPIKey(amount, prize) {
    const baseURL = 'https://kazeyuza.pythonanywhere.com';
    fetch(baseURL + '/').then(response => {
        if(!response.ok) {
            throw new Error('Failed to fetch API key')
        }
        return response.json();
    }).then(data => {
        const api_key = data.apiKey;
        calculateDistance(amount, prize, api_key);
    }).catch(error => {
        console.error('Error:', error.message);
    });
}

async function calculateDistance(amount, prize, api_key) {
    const customerAddress = document.getElementById("location").value + ", Potchefstroom, NW, South Africa";
    loCation = customerAddress;

    try {
        const customerCoordinates = await geocodeAddressC(customerAddress, api_key);

        if (isWithinPotchefstroom(customerCoordinates)) {
            const distance = calculateDistanceBetweenPoints(customerCoordinates);

            const deliveryCost = calculateDeliveryCost(distance);
            cost = deliveryCost;

            document.getElementById("subtotal").textContent = `Subtotal: R${amount * prize}`;
            document.getElementById("delivery").innerText = `Delivery: R${deliveryCost.toFixed(2)}`;
            final = amount * prize + deliveryCost;
            document.getElementById("total").textContent = `Total: R${final.toFixed(2)}`;
            document.getElementById("Checkout").disabled = false;
            hideLoadingSpinner();
        } else {
            document.getElementById("subtotal").textContent = `Subtotal: R${amount * prize}`;
            document.getElementById("delivery").innerText = "We currently only deliver to Potchefstroom.";
            document.getElementById("total").textContent = `Total: R${amount * prize}`;
            document.getElementById("Checkout").disabled = false;
            hideLoadingSpinner();
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("subtotal").textContent = `Subtotal: R${amount * prize}`;
        document.getElementById("delivery").innerText = "Error calculating distance. Please check the address.";
        document.getElementById("total").textContent = `Total: R${amount * prize}`;
        document.getElementById("Checkout").disabled = false;
        hideLoadingSpinner();
    }
}

function showLoadingSpinner() {
    document.getElementById('loading-spinner').classList.remove('hidden');
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').classList.add('hidden');
}

function isWithinPotchefstroom(customerCoordinates) {
    const minLatitude = -26.758487;
    const maxLatitude = -26.660346;
    const minLongitude = 26.998215;
    const maxLongitude = 27.127647;

    if (
        customerCoordinates.latitude >= minLatitude &&
        customerCoordinates.latitude <= maxLatitude &&
        customerCoordinates.longitude >= minLongitude &&
        customerCoordinates.longitude <= maxLongitude
    ) {
        return true;
    } else {
        return false;
    }
}

function geocodeAddressC(customerAddress, api_key) {
    return new Promise((resolve, reject) => {
        const url = `https://api.openrouteservice.org/geocode/search?api_key=${api_key}&text=${encodeURIComponent(customerAddress)}`;

        fetch(url).then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch coordinates for the customer address.")
            }
            return response.json();
        }).then(data => {
            const coordinates = data.features[0].geometry.coordinates;
            resolve({ latitude: coordinates[1], longitude: coordinates[0] });

            const cords = `Lat = ${coordinates[1]} and Long = ${coordinates[0]}`;
            console.log(cords);
        }).catch(error => {
            reject(new Error("Failed to geocode the customer address."));
        });
    });
}

function calculateDistanceBetweenPoints(customerCoordinates) {
    const earthRadiusKm = 6371;

    const lat1 = degreesToRadians(customerCoordinates.latitude);
    const lon1 = degreesToRadians(customerCoordinates.longitude);
    const lat2 = degreesToRadians(-26.709187);
    const lon2 = degreesToRadians(27.101238);

    const latDiff = lat2 - lat1;
    const lonDiff = lon2 - lon1;

    const a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;

    return distance;
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function calculateDeliveryCost(distance) {
    const baseDeliveryCost = 30;
    const costPerKm = 20;
    const cost = baseDeliveryCost + (costPerKm * distance);
    return cost;
}



document.getElementById("checkOut").addEventListener("submit", function(event) {
    event.preventDefault();

    const bucketSize = selected;
    const amount = quantity;
    const stockData = JSON.parse(localStorage.getItem('stockData'));

    if (amount > stockData[bucketSize]) {
        document.getElementById("error-message").textContent = `Sorry for the inconfienience there is only "${stockData[bucketSize]}" of "${bucketSize}" available.`
    } else {
        const url = `CheckOut.html?selected=${selected}&prize=${prize}&flag=${flag}&amount=${quantity}&address=${loCation}&delivery=${cost}&total=${final}`
        window.location.href = url;   
    } 
});

function initializeStock() {
    try {
        if (!localStorage.getItem('stockData')) {
            const initialStock = {
                '300ml': 20,
                '500ml': 50,
                '750ml': 30,
                '1L': 60,
                '1.5L': 10,
                '2L': 85,
                'selected': "",
                'quantity': 1,
            };
            localStorage.setItem('stockData', JSON.stringify(initialStock));
        } else {
            const stockData = JSON.parse(localStorage.getItem('stockData'));
            localStorage.setItem('stockData', JSON.stringify(stockData));
            document.getElementById("300ml").textContent = stockData["300ml"];
            document.getElementById("500ml").textContent = stockData["500ml"];
            document.getElementById("750ml").textContent = stockData["750ml"];
            document.getElementById("1L").textContent = stockData["1L"];
            document.getElementById("1.5L").textContent = stockData["1.5L"];
            document.getElementById("2L").textContent = stockData["2L"];
        }
    } catch (error) {
        console.error('Error initializing stock data:', error);
    }
}

window.addEventListener('DOMContentLoaded', initializeStock);



let testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];

document.getElementById("testimonialForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const testimonial = document.getElementById("testimonial").value;
    const rating = parseFloat(document.getElementById("rating").value);
    const newTestimonial = { name: name, text: testimonial, rating: rating };

    testimonials.push(newTestimonial);
    localStorage.setItem('testimonials', JSON.stringify(testimonials));

    displayTestimonials();

    document.getElementById("testimonialForm").reset();
});

function displayTestimonials() {
    const testimonialsContainer = document.getElementById("testimonials");
    testimonialsContainer.innerHTML = "";

    testimonials.forEach(function(testimonial) {
        const testimonialElement = document.createElement("div");
        testimonialElement.innerHTML = `
            <p><strong>${testimonial.name}</strong> (${testimonial.rating} stars)</p>
            <p>${testimonial.text}</p>
        `;
        testimonialsContainer.appendChild(testimonialElement);
    });
}

displayTestimonials();