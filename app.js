const md = window.markdownit();
const apiUrl = "http://localhost:3500/ask";

// Get the elements from the DOM
const inputField = document.getElementById('input');
const submitButton = document.getElementById('submit');
const resultDiv = document.getElementById('result');
let loading = false;

// Add an event listener to the button
submitButton.addEventListener('click', askGPT);
inputField.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    askGPT();
  }
});


const setOutput = (output) => {
    resultDiv.innerHTML = output;
};

const setLoading = (value) => {
    loading = value;
    submitButton.disabled = value;
};

// Function to convert the markdown text
function askGPT() {
    if (loading) {
        return;
    }
    setLoading(true);
    var source = new EventSource(
    `${apiUrl}?prompt=${encodeURIComponent(inputField.value)}`
    );
    inputField.value = "";

    let pureCode = "";
    source.onmessage = function (event) {
        if (event.data !== undefined || event.data !== "undefined") {
            let cleaned = event.data.replace(/-%nl%-/g, "\n");

            if (cleaned === "%%STRIMDONE%%") {
                source.close();
                setLoading(false);
                return;
            }

            if (cleaned === "%%STRIMERROR%%") {
                setOutput(
                    "Error: Something went wrong. Please reload, and try again."
                );
                source.close();
                setLoading(false);
                return;
            }

            pureCode += cleaned;
            setOutput(md.render(pureCode));
        }
    };

    // Handle any errors that occur
    source.onerror = function (error) {
        setOutput("Error: Something went wrong. Please reload, and try again.")
        console.error("Error: " + error);
    };
}
