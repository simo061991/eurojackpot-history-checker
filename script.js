// script.js

document.addEventListener("DOMContentLoaded", () => {
    const mainGrid = document.getElementById("main-numbers");
    const euroGrid = document.getElementById("euro-numbers");
    const checkButton = document.getElementById("check-button");
    const resultsContainer = document.getElementById("results");

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

    createButtons(50, mainGrid, 5);
    createButtons(12, euroGrid, 2);

    const getSelectedNumbers = (container) => {
        return Array.from(container.querySelectorAll(".selected"))
            .map((btn) => parseInt(btn.textContent));
    };

    checkButton.addEventListener("click", () => {
        const selectedMain = getSelectedNumbers(mainGrid);
        const selectedEuro = getSelectedNumbers(euroGrid);

        if (selectedMain.length !== 5 || selectedEuro.length !== 2) {
            alert("Please select exactly 5 main numbers and 2 Euro numbers.");
            return;
        }

        fetch("data/eurojackpot.json")
            .then((res) => res.json())
            .then((data) => {
                const matchingDraws = Object.entries(data)
                    .map(([date, numbers]) => {
                        const mainNumbers = numbers.slice(0, 5);
                        const euroNumbers = numbers.slice(5);

                        const matchedMain = selectedMain.filter(num => mainNumbers.includes(num)).length;
                        const matchedEuro = selectedEuro.filter(num => euroNumbers.includes(num)).length;

                        return {
                            date,
                            matchedMain,
                            matchedEuro
                        };
                    })
                    .filter(result => result.matchedMain >= 2 && result.matchedEuro >= 1)
                    .sort((a, b) => {
                        const totalA = a.matchedMain * 10 + a.matchedEuro;
                        const totalB = b.matchedMain * 10 + b.matchedEuro;
                        return totalB - totalA;
                    });

                resultsContainer.innerHTML = matchingDraws.length > 0
                    ? `<p>Found ${matchingDraws.length} draw(s) with at least 2 main and 1 Euro number:</p>` +
                    '<ul>' + matchingDraws.map(draw => `<li>${draw.date} - ${draw.matchedMain}+${draw.matchedEuro} matched</li>`).join('') + '</ul>'
                    : '<p>No matches found with at least 2 main and 1 Euro number.</p>';
            })
            .catch((err) => {
                console.error("Error loading JSON:", err);
                resultsContainer.innerHTML = '<p>Error loading draw data.</p>';
            });
    });
});