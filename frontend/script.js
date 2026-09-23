const form = document.getElementById("predictionForm");

const predictButton = document.getElementById("predictButton");

const buttonText = document.getElementById("buttonText");

const loader = document.getElementById("loader");

const errorMessage = document.getElementById("errorMessage");

const resultPlaceholder =
    document.getElementById("resultPlaceholder");

const resultContent =
    document.getElementById("resultContent");

const yieldValue =
    document.getElementById("yieldValue");

const resultState =
    document.getElementById("resultState");

const resultCrop =
    document.getElementById("resultCrop");

const resultYear =
    document.getElementById("resultYear");


form.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Clear previous error

    errorMessage.classList.add("hidden");

    errorMessage.textContent = "";


    // Get form values

    const state =
        document.getElementById("state").value.trim();

    const district =
        document.getElementById("district").value.trim();

    const year =
        Number(document.getElementById("year").value);

    const season =
        document.getElementById("season").value;

    const crop =
        document.getElementById("crop").value.trim();

    const area =
        Number(document.getElementById("area").value);


    // Basic validation

    if (!state || !district || !season || !crop) {

        showError(
            "Please fill in all required fields."
        );

        return;
    }


    if (area <= 0) {

        showError(
            "Area must be greater than 0."
        );

        return;
    }


    // Request body

    const requestData = {

        State_Name: state,

        District_Name: district,

        Crop_Year: year,

        Season: season,

        Crop: crop,

        Area: area

    };


    // Loading state

    setLoading(true);


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/predict",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(requestData)
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Prediction request failed."
            );

        }


        // Get prediction

        const prediction =
            Number(data.predicted_yield);


        if (!Number.isFinite(prediction)) {

            throw new Error(
                "Invalid prediction received from API."
            );

        }


        // Show result

        showResult(
            prediction,
            state,
            crop,
            year
        );


    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Unable to connect to the prediction API."
        );

    } finally {

        setLoading(false);

    }

});


function setLoading(isLoading) {

    if (isLoading) {

        predictButton.disabled = true;

        buttonText.textContent = "Predicting...";

        loader.classList.remove("hidden");

    } else {

        predictButton.disabled = false;

        buttonText.textContent =
            "Predict Crop Yield";

        loader.classList.add("hidden");

    }

}


function showResult(
    prediction,
    state,
    crop,
    year
) {

    resultPlaceholder.classList.add("hidden");

    resultContent.classList.remove("hidden");


    // Format number

    let formattedPrediction;


    if (prediction < 1) {

        formattedPrediction =
            prediction.toFixed(3);

    } else if (prediction < 100) {

        formattedPrediction =
            prediction.toFixed(2);

    } else {

        formattedPrediction =
            Math.round(prediction).toLocaleString(
                "en-IN"
            );

    }


    yieldValue.textContent =
        formattedPrediction;


    resultState.textContent =
        state;

    resultCrop.textContent =
        crop;

    resultYear.textContent =
        year;

}


function showError(message) {

    errorMessage.textContent = message;

    errorMessage.classList.remove("hidden");

}