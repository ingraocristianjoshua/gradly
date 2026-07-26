document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let exams = JSON.parse(localStorage.getItem('gradly_exams')) || [];
    let thesisPoints = parseInt(localStorage.getItem('gradly_thesis')) || 0;

    // --- DOM Elements ---
    const form = document.getElementById('exam-form');
    const examsList = document.getElementById('exams-list');
    const thesisSlider = document.getElementById('thesis-points');
    const thesisDisplay = document.getElementById('thesis-points-display');
    const resetBtn = document.getElementById('reset-btn');

    // Stats
    const elMediaAritmetica = document.getElementById('media-aritmetica');
    const elMediaPonderata = document.getElementById('media-ponderata');
    const elVotoPartenza = document.getElementById('voto-partenza');
    const elTotaleCfu = document.getElementById('totale-cfu');
    const elVotoFinale = document.getElementById('voto-finale');

    // --- Functions ---
    function saveState() {
        localStorage.setItem('gradly_exams', JSON.stringify(exams));
        localStorage.setItem('gradly_thesis', thesisPoints);
    }

    function calculateStats() {
        if (exams.length === 0) {
            elMediaAritmetica.textContent = "0.00";
            elMediaPonderata.textContent = "0.00";
            elVotoPartenza.textContent = "0.00";
            elTotaleCfu.textContent = "0";
            elVotoFinale.innerHTML = "0";
            return;
        }

        let sumGrades = 0;
        let sumWeightedGrades = 0;
        let sumCfu = 0;

        exams.forEach(exam => {
            const grade = exam.lode ? 30 : exam.grade; // La lode vale 30 ai fini del calcolo
            sumGrades += grade;
            sumWeightedGrades += (grade * exam.cfu);
            sumCfu += exam.cfu;
        });

        const aritmetica = sumGrades / exams.length;
        const ponderata = sumWeightedGrades / sumCfu;
        const partenza = (ponderata * 110) / 30;

        const finale = Math.round(partenza + thesisPoints);
        const lodeFinale = finale >= 111 ? "<span style='font-size:0.5em; display:block; line-height:0.8'>e Lode</span>" : "";
        const finaleCapped = finale > 110 ? 110 : finale;

        // Render
        elMediaAritmetica.textContent = aritmetica.toFixed(2);
        elMediaPonderata.textContent = ponderata.toFixed(2);
        elVotoPartenza.textContent = partenza.toFixed(2);
        elTotaleCfu.textContent = sumCfu;
        
        elVotoFinale.innerHTML = `${finaleCapped}${lodeFinale}`;
    }

    function renderExams() {
        examsList.innerHTML = '';
        exams.forEach((exam, index) => {
            const tr = document.createElement('tr');
            
            const nameTd = document.createElement('td');
            nameTd.textContent = exam.name || `Esame ${index + 1}`;
            
            const gradeTd = document.createElement('td');
            gradeTd.innerHTML = `<strong>${exam.grade}</strong>${exam.lode ? '<span class="badge-lode">Lode</span>' : ''}`;
            
            const cfuTd = document.createElement('td');
            cfuTd.textContent = exam.cfu;
            
            const actionTd = document.createElement('td');
            const delBtn = document.createElement('button');
            delBtn.className = 'action-btn';
            delBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            delBtn.onclick = () => {
                removeExam(index);
            };
            actionTd.appendChild(delBtn);
            
            tr.appendChild(nameTd);
            tr.appendChild(gradeTd);
            tr.appendChild(cfuTd);
            tr.appendChild(actionTd);
            
            examsList.appendChild(tr);
        });
        
        calculateStats();
    }

    function addExam(name, grade, cfu, lode) {
        exams.push({
            name: name,
            grade: parseInt(grade),
            cfu: parseInt(cfu),
            lode: lode
        });
        saveState();
        renderExams();
    }

    function removeExam(index) {
        exams.splice(index, 1);
        saveState();
        renderExams();
    }

    // --- Event Listeners ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('exam-name');
        const gradeInput = document.getElementById('exam-grade');
        const cfuInput = document.getElementById('exam-cfu');
        const lodeInput = document.getElementById('exam-lode');

        // Seleziona se la lode è vera. Rimuovi la lode se il voto è inferiore a 30.
        let lode = lodeInput.checked;
        if (parseInt(gradeInput.value) < 30) {
            lode = false;
        }

        addExam(nameInput.value, gradeInput.value, cfuInput.value, lode);
        
        // Reset form
        nameInput.value = '';
        gradeInput.value = '';
        cfuInput.value = '';
        lodeInput.checked = false;
        nameInput.focus();
    });

    thesisSlider.addEventListener('input', (e) => {
        thesisPoints = parseInt(e.target.value);
        thesisDisplay.textContent = `+${thesisPoints}`;
        saveState();
        calculateStats();
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Sei sicuro di voler cancellare tutti i dati inseriti?')) {
            exams = [];
            thesisPoints = 0;
            thesisSlider.value = 0;
            thesisDisplay.textContent = "+0";
            saveState();
            renderExams();
        }
    });

    // --- Initialization ---
    thesisSlider.value = thesisPoints;
    thesisDisplay.textContent = `+${thesisPoints}`;
    renderExams();
});
