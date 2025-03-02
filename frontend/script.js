async function connectWallet() {
    if (!window.ethereum) {
        document.getElementById("status").innerText = "Metamask not detected";
        return;
    }

    const web3 = new Web3(window.ethereum);
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const address = accounts[0];
    const message = `Sign this message to verify ownership: ${Date.now()}`;
    
    try {
        const signature = await web3.eth.personal.sign(message, address, "");
        const response = await fetch("http://localhost/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, signature, message })
        });

        const data = await response.json();
        document.getElementById("status").innerText = data.message || "Error verifying";
    } catch (error) {
        document.getElementById("status").innerText = "Verification failed";
    }
}
