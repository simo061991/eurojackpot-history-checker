// script.js

document.addEventListener("DOMContentLoaded", () => {
    const mainGrid = document.getElementById("main-numbers");
    const euroGrid = document.getElementById("euro-numbers");
    const checkButton = document.getElementById("check-button");
    const resultsContainer = document.getElementById("results");

    // Function to create buttons for number selection
    const createButtons = (count, container, limit) => {
        for (let i = 1; i <= count; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.addEventListener("click", () => {
                btn.classList.toggle("selected");
                const selected = container.querySelectorAll(".selected");
                if (selected.length > limit) {
                    selected[selected.length - 1].classList.remove("selected");
                }
            });
            container.appendChild(btn);
        }
    };

    // Create buttons for main numbers (1-50) and Euro numbers (1-12)
    createButtons(50, mainGrid, 5);
    createButtons(12, euroGrid, 2);

    // Function to get the selected numbers from a container
    const getSelectedNumbers = (container) => {
        return Array.from(container.querySelectorAll(".selected"))
            .map((btn) => parseInt(btn.textContent));
    };

    // Event listener for the "Check" button click
    checkButton.addEventListener("click", () => {
        const selectedMain = getSelectedNumbers(mainGrid);
        const selectedEuro = getSelectedNumbers(euroGrid);

        // Ensure exactly 5 main numbers and 2 Euro numbers are selected
        if (selectedMain.length !== 5 || selectedEuro.length !== 2) {
            alert("Please select exactly 5 main numbers and 2 Euro numbers.");
            return;
        }

        // Fetch Eurojackpot data from the JSON file
        fetch("data/eurojackpot.json")
            .then((res) => res.json())
            .then((data) => {
                // Process each draw date and compare selected numbers with draw numbers
                const matchingDraws = Object.entries(data)
                    .map(([date, numbers]) => {
                        const mainNumbers = numbers.slice(0, 5);
                        const euroNumbers = numbers.slice(5);

                        // Count how many main and Euro numbers are matched
                        const matchedMain = selectedMain.filter(num => mainNumbers.includes(num)).length;
                        const matchedEuro = selectedEuro.filter(num => euroNumbers.includes(num)).length;

                        return {
                            date,
                            matchedMain,
                            matchedEuro
                        };
                    })
                    // Filter the results to include combinations like:
                    // 5+2, 5+1, 5+0, 4+2, 4+1, 3+2, 4+0, 2+2, 3+1, 3+0, 1+2, 2+1
                    .filter(result => (
                        (result.matchedMain === 5 && result.matchedEuro === 2) ||  // 5+2
                        (result.matchedMain === 5 && result.matchedEuro === 1) ||  // 5+1
                        (result.matchedMain === 5 && result.matchedEuro === 0) ||  // 5+0
                        (result.matchedMain === 4 && result.matchedEuro === 2) ||  // 4+2
                        (result.matchedMain === 4 && result.matchedEuro === 1) ||  // 4+1
                        (result.matchedMain === 3 && result.matchedEuro === 2) ||  // 3+2
                        (result.matchedMain === 4 && result.matchedEuro === 0) ||  // 4+0
                        (result.matchedMain === 2 && result.matchedEuro === 2) ||  // 2+2
                        (result.matchedMain === 3 && result.matchedEuro === 1) ||  // 3+1
                        (result.matchedMain === 3 && result.matchedEuro === 0) ||  // 3+0
                        (result.matchedMain === 1 && result.matchedEuro === 2) ||  // 1+2
                        (result.matchedMain === 2 && result.matchedEuro === 1)     // 2+1
                    ))
                    // Sort results to show the highest matches first (main numbers * 10 + Euro numbers)
                    .sort((a, b) => {
                        const totalA = a.matchedMain * 10 + a.matchedEuro;
                        const totalB = b.matchedMain * 10 + b.matchedEuro;
                        return totalB - totalA;
                    });

                // Display the results
                resultsContainer.innerHTML = matchingDraws.length > 0
                    ? `<p>Found ${matchingDraws.length} draw(s) with valid combinations:</p>` +
                    '<ul>' + matchingDraws.map(draw => {
                        let matchText = `${draw.matchedMain}+${draw.matchedEuro}`;
                        return `<li>${draw.date} - ${matchText} matched</li>`;
                    }).join('') + '</ul>'
                    : '<p>No matches found with valid combinations.</p>';
            })
            .catch((err) => {
                console.error("Error loading JSON:", err);
                resultsContainer.innerHTML = '<p>Error loading draw data.</p>';
            });
    });
});
