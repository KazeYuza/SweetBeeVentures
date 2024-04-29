document.getElementById("edit").addEventListener("submit", function(event) {
    event.preventDefault();

    let flag = 0;
    const count = ['300ml', '500ml', '750ml', '1L', '1.5L', '2L'];

    for (let i = 0; i < count.length; i++) {
        if (document.getElementById(count[i])) {
            const invalid = document.getElementById(count[i]).value;
            const parseValue = parseFloat(invalid);
            if (isNaN(parseValue)) {
                document.getElementById(count[i]).value = `The value "${invalid}" is invalid.`;
                break;
            }
        }
        flag++;
    }

    if (flag === 6) {
        for (let i = 0; i < count.length; i++) {
            const amount = Number(document.getElementById(count[i]).value);
            const bucketSize = count[i];
            updateStock(bucketSize, amount);
        }
    }
})

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
        stockData[bucketSize] += amount;
        localStorage.setItem('stockData', JSON.stringify(stockData));
        document.getElementById(bucketSize).value = `Total = ${stockData[bucketSize]}`;
    } catch (error) {
        console.error('Error updating stock data:', error);
    }    
}