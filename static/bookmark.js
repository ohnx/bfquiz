/* attempt to shoehorn this into a bookmark */
let elems = document.querySelectorAll("[type='text/x-config']");
let pgtitle = document.title;

function bfquiz__alternate_parse(quizCfg, pgtitle) {
    var i, j, k;
    let quizResults = quizCfg['subbuzz']['results'];
    let outputStr = `<h1>Result cheat sheet</h1>`;

    let quizQuestions = quizCfg['subbuzz']['questions'];
    let how_to_get_results = new Array(quizResults.length).fill(null);
    if (quizCfg['subbuzz']['type'] == 'personality') {
        for (i = 0; i < how_to_get_results.length; i++) {
            how_to_get_results[i] = new Array(quizQuestions.length).fill(null);
        }
        for (i = 0; i < quizQuestions.length; i++) {
            for (j = 0; j < quizQuestions[i].answers.length; j++) {
                let msg = quizQuestions[i].answers[j].header;
                if (!msg) msg = `answer #${(j+1)}`;
                else msg = `"${msg}"`;
                if (how_to_get_results[quizQuestions[i].answers[j].personality_index][i]) {
                    how_to_get_results[quizQuestions[i].answers[j].personality_index][i].push(msg);
                } else {
                    how_to_get_results[quizQuestions[i].answers[j].personality_index][i] = [msg];
                }
            }
        }
    }

    for (i = 0; i < quizResults.length; i++) {
        if ((!(quizResults[i].header)) && (!(quizResults[i].description))) continue;
        let hasImage = ('image' in quizResults[i]) && (quizResults[i].image.length > 0);
        outputStr += `<div class="result"><div class="left"${hasImage?'':' style="width: 100%"'}>`;
        outputStr += `<h2 class="result-heading">${quizResults[i].header}</h2>`;
        if (quizResults[i].description) outputStr += `<p class="result-desc">${quizResults[i].description}</p>`;
        if (how_to_get_results[i]) {
            outputStr += `<p class="result-howto"><i>How to get this result:</i><ul>`;
            for (j = 0; j < how_to_get_results[i].length; j++) {
                if (!how_to_get_results[i][j]) continue;
                outputStr += `<li>Question ${j+1} pick `;
                for (k = 0; k < how_to_get_results[i][j].length; k++) {
                    outputStr += how_to_get_results[i][j][k];
                    if (k == how_to_get_results[i][j].length - 2) {
                        if (how_to_get_results[i][j].length == 2) {
                            outputStr += ' or ';
                        } else {
                            outputStr += ', or ';
                        }
                    } else if (k < how_to_get_results[i][j].length - 2) {
                        outputStr += ', ';
                    }
                }
                outputStr += `</li>`;
            }
            outputStr += `</ul></p>`;
        } else if (('range_start' in quizResults[i]) && ('range_end' in quizResults[i])) {
            outputStr += `<p class="result-howto"><i>How to get this result:</i> `;
            outputStr += `Check/get correct between ${quizResults[i]['range_start']}% and ${quizResults[i]['range_end']}% of the boxes/questions</p>`;
        }
        outputStr += '</div><div class="right">';
        if (hasImage) {
            outputStr += `<a target="_blank" href="${quizResults[i].data_src}"><img src="${quizResults[i].image}" `;
            outputStr += `alt="${quizResults[i].alt_text}" `;
            if ((quizResults[i].image_height) && (quizResults[i].image_width)) {
                outputStr += `height="${quizResults[i].image_height}" width="${quizResults[i].image_width}"`;
            }
            outputStr += '/></a>';
        }
        outputStr += '</div></div>';
    }

    document.getElementById('results').innerHTML = outputStr;
}

function bfquiz__parse1() {
    for (var elem_idx in elems) {
        let elem = elems[elem_idx];
        let quizCfg = JSON.parse(elem.innerText);
    
        try {
            if ('subbuzz' in quizCfg) {
                return bfquiz__alternate_parse(quizCfg, pgtitle);
            } else if (!('data' in quizCfg)) {
                /* this page has multiple x-config's and this one is the wrong one; try to find the next one */
                continue;
            }
            let quizContents = quizCfg['data'];
            if ('content' in quizContents) {
                /* sometimes there is a data -> content -> results, other times it is just data -> results. */
                quizContents = quizContents['content'];
            }
            let quizResults = quizContents['results'];
            let outputStr = `<h1>Result cheat sheet</h1>`;
        
            let quizQuestions = quizContents['questions'];
            let how_to_get_results = {};
            var i, j, k;
            /* wrap all this code in a second try-catch because it's super beta code */
            try {
                /* check that some values exist */
                if (!quizQuestions[0].answers[0].resultId) throw "sad";
                for (var key in quizResults) {
                    how_to_get_results[quizResults[key].pid] = new Array(quizQuestions.length).fill(null);
                }
                for (i = 0; i < quizQuestions.length; i++) {
                    for (j = 0; j < quizQuestions[i].answers.length; j++) {
                        let msg = quizQuestions[i].answers[j].text;
                        if (!msg) msg = `answer #${(j+1)}`;
                        else msg = `"${msg}"`;
                        if (how_to_get_results[quizQuestions[i].answers[j].resultId][i]) {
                            how_to_get_results[quizQuestions[i].answers[j].resultId][i].push(msg);
                        } else {
                            how_to_get_results[quizQuestions[i].answers[j].resultId][i] = [msg];
                        }
                    }
                }
            } catch (e2) {
                console.error(e2);
            }
        
            /* sometimes the results are an array, other times they are an object. this covers both */
            for (var key in quizResults) {
                let quizResult = quizResults[key];
                /* if there is no image, display text full width */
                let hasImage = ('image' in quizResult) && (Object.keys(quizResult.image).length > 0);
        
                outputStr += `<div class="result"><div class="left"${hasImage?'':' style="width: 100%"'}>`;
                outputStr += `<h2 class="result-heading">${quizResult.title}</h2>`;
                if (quizResult.description) outputStr += `<p class="result-desc">${quizResult.description}</p>`;
                if ('pid' in quizResult && how_to_get_results[quizResult.pid]) {
                    outputStr += `<p class="result-howto"><i>How to get this result:</i><ul>`;
                    for (j = 0; j < how_to_get_results[quizResult.pid].length; j++) {
                        if (!how_to_get_results[quizResult.pid][j]) continue;
                        outputStr += `<li>Question ${j+1} pick `;
                        for (k = 0; k < how_to_get_results[quizResult.pid][j].length; k++) {
                            outputStr += how_to_get_results[quizResult.pid][j][k];
                            if (k == how_to_get_results[quizResult.pid][j].length - 2) {
                                if (how_to_get_results[quizResult.pid][j].length == 2) {
                                    outputStr += ' or ';
                                } else {
                                    outputStr += ', or ';
                                }
                            } else if (k < how_to_get_results[quizResult.pid][j].length - 2) {
                                outputStr += ', ';
                            }
                        }
                        outputStr += `</li>`;
                    }
                    outputStr += `</ul></p>`;
                } else if ('pointsRequired' in quizResult) {
                    outputStr += `<p class="result-howto"><i>How to get this result:</i> `;
                    outputStr += `Get at least ${quizResult['pointsRequired']} points on the quiz</p>`;
                }
                outputStr += '</div><div class="right">';
                if (hasImage) {
                    outputStr += `<a target="_blank" href="${quizResult.image.creditURL?quizResult.image.creditURL:quizResult.image.src}"><img src="${quizResult.image.src}" `;
                    outputStr += `alt="${quizResult.image.alt}" `;
                    if ('meta' in quizResult.image) {
                        outputStr += `height="${quizResult.image.meta.height}" width="${quizResult.image.meta.width}"`;
                    }
                    outputStr += '/></a>';
                }
                outputStr += '</div></div>';
            }
            document.getElementById('results').innerHTML = outputStr;
            return;
        } catch (e) {
            console.error(e);
            document.getElementById('msgs').innerHTML = 'Failed to parse the quiz config. This quiz may be an unsupported type that does not show results, or Buzzfeed may have updated its format, causing this tool to no longer work.';
            return;
        }
    }
}

const BUZZ_RESULT_CARD = ".subbuzz-quiz__result-card";
const BUZZ_SIDEBAR = "main>div>section";

function bfquiz__bookmark() {
    let resultsDiv = document.createElement('div');
    //let parentDiv = document.querySelector(BUZZ_RESULT_CARD);
    let parentDiv = document.querySelector(BUZZ_SIDEBAR);
    resultsDiv.setAttribute('id', 'results');
    //parentDiv.appendChild(resultsDiv);
    //parentDiv.classList.remove('js-hidden');
    parentDiv.innerHTML = '<div id="results" style="position:fixed;overflow-y:scroll;height:90%;"></div>';
    /* so the new node appears  */
    setTimeout(function() {
        bfquiz__parse1();
    }, 10);
}

(function() {bfquiz__bookmark();})();

// javascript:(function(){var e=document.createElement('script');e.setAttribute('src', 'https://gistcdn.githack.com/ohnx/7fc109c90cc518c6ed8514db47b42893/raw/660ed25155a05cd43b99292c965fa3be6ac4e09f/gistfile1.js');document.body.appendChild(e)})()
