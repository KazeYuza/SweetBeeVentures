document.getElementById("falidate").addEventListener("submit", function(event) {
    event.preventDefault();

    const user = "Erik";
    const pass = 777;

    if (document.getElementById("userName").value === user && parseInt(document.getElementById("passWord").value) === pass) {
        const url = `Admin.html?`;
        window.location.href = url;
    } else {
        if (document.getElementById("userName").value !== user) {
            document.getElementById("error-message").textContent = `Please check if your "Username" is correct.`;
        } else if (parseInt(document.getElementById("passWord").value) !== pass) {
            document.getElementById("error-message").textContent = `Please check if your "Password" is correct.`;
        }
    }
})