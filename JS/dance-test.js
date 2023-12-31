let danceTitle;
let currentIndex = 0;
const imagePaths = ["../img/IAM-test.png", "../img/파이팅해야지.png"];
let danceConditoin = document.getElementById('dance-score');
let score = 0;

document.addEventListener('DOMContentLoaded', function () {
    // 값 가져오기
    const params = new URLSearchParams(window.location.search);
    danceTitle = params.get('danceTitle');
    console.log(danceTitle)
    // dance-name에 알맞은 이름 넣기
    const danceNameElement = document.getElementById('dance-name');
    if (danceNameElement) {
        danceNameElement.textContent = danceTitle || 'not found';
    };
});

const URL = "./TeachableMachine-Module/";
let model, webcam, ctx, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    const danceImg = document.getElementById('dance-img');

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    danceImg.style.backgroundSize = '225%';
    danceImg.style.backgroundPosition = '45% 100%';
    danceImg.style.backgroundRepeat = 'no-repeat';

    showNextImage(danceImg);

    // Convenience function to setup a webcam
    const xsize = 1000;
    const ysize = 720;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(xsize, ysize, flip);
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = xsize; canvas.height = ysize;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

    danceResult();
}
document.getElementById('container2-text').addEventListener('click', function() {
    var audio = document.getElementById('audio');
    if(danceTitle === "I AM"){
        audio.src = './audio/iam.mp3';
    } else if(danceTitle === "Super Shy"){
        audio.src = './audio/supeyshy.mp3';
    } else {
        audio.src = './audio/파이팅해야지.mp3';
    }
    audio.play();
});

function danceResult() {
    if (currentIndex === imagePaths.length - 1) {
        setTimeout(() => {
            window.location.href = 'dance-result.html'; // dance-result 페이지로 이동
        }, 30000); // 30초 대기 후 이동
        return;
    }
}

function showNextImage(danceImg){    
    danceImg.style.backgroundImage = `url("${imagePaths[currentIndex]}")`;
    currentIndex = (currentIndex + 1) % imagePaths.length;
    setTimeout(() => showNextImage(danceImg), 3000);
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    if(currentIndex === 0){
        if(prediction[0].probability >= 0.7) {
            danceConditoin.innerHTML = "춤 실력이 마이클잭슨 ㄷㄷ";
            score+=5;
        }
        else if(prediction[0].probability  >= 0.4){
            danceConditoin.innerHTML = "봐줄만은 해요"
            score+=3;
        }

        else {
            danceConditoin.innerHTML = "심각한 몸치... 하자왕 등극"
            score+=1;
        }
    }

    if(currentIndex === 1){
        if(prediction[1].probability >= 0.7) {
            danceConditoin.innerHTML = "춤 실력이 마이클잭슨 ㄷㄷ"
            score+=5;
        }
        else if(prediction[1].probability >= 0.4){
            danceConditoin.innerHTML = "봐줄만은 해요"
            score+=3;
        }

        else {
            danceConditoin.innerHTML = "심각한 몸치... 하자왕 등극"
            score+=1;
        }
    }
    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}

function danceResult() {
    if (currentIndex === imagePaths.length - 1) {
        // Save danceTitle to localStorage
        localStorage.setItem('danceName', danceTitle);

        setTimeout(() => {
            // Redirect to dance-result.html with the score as a query parameter
            window.location.href = `dance-result.html?score=${score}`;
        }, 30000); // 30 seconds wait before redirecting
        return;
    }
}