var yearEle = document.getElementById("year");
var monthEle = document.getElementById("month");
var daysTableEle = document.getElementById("daysTable");
var inputBoxEle = document.getElementById("inputBox");
var listBoxEle = document.getElementById("listBox");
var inputMemo = document.getElementById("inputMemo");

var cellElements = []; // cell이 생성된 후 넣어지게될 배열
var selectKey = null; // 선택한 셀의 키값
var currentDateId = ""; // 현재 날짜 셀 id값
var everyMonthDayId = ""; // 매월 1일 셀 id값
var preSelectEle = null; // 이전에 선택되었던 항목. (스타일 복귀 위한 변수)


document.addEventListener("DOMContentLoaded", function () {
  var currentDate = new Date(); // Tue Jan 02 2024 21:56:06 GMT+0900 (한국 표준시)
  var currentYear = currentDate.getFullYear();
  var currentMonth = currentDate.getMonth(); // 월은 0부터 11까지로 표기

  currentDateId = `${currentYear}-${currentMonth + 1}-${currentDate.getDay()}`;

  // 년, 월에 따른 테이블 보여주기
  displayCalendar(currentYear, currentMonth);

  if (selectKey === null) showList(everyMonthDayId); // 아무것도 선택하지 않은 첫 화면이면 1일 화면 보여주기

  // 이전달 클릭 이벤트
  document
    .getElementById("prevBtn")
    .addEventListener("click", function () {
      selectKey = null;
      currentYear = currentMonth === 0 ? currentYear - 1 : currentYear; // 1월이라면 현재년도에서 -1
      currentMonth = currentMonth === 0 ? 11 : currentMonth - 1; // 1월이라면 12월달로
      displayCalendar(currentYear, currentMonth);
      showList(everyMonthDayId);
    });

  // 다음달 클릭 이벤트
  document
    .getElementById("nextBtn")
    .addEventListener("click", function () {
      selectKey = null;
      currentYear = currentMonth === 11 ? currentYear + 1 : currentYear; // 12월이라면 현재년도에서 +1
      currentMonth = (currentMonth + 1) % 12; // 해당 월에서 12를 나눈 나머지
      displayCalendar(currentYear, currentMonth);
      showList(everyMonthDayId);
    });
});

// 일정 입력 취소 버튼 클릭 이벤트
document.getElementById("cancelBtn").addEventListener("click", function () {
  // 작성한 내용 삭제, 초기화면으로
  inputMemo.value = "";
  toggleBoxes(listBoxEle, inputBoxEle);
});

// 세이브 버튼 클릭 이벤트
document.getElementById("saveBtn").addEventListener("click", function () {
  // 입력값 localstorage에 저장
  var inputVal = inputMemo.value;
  if (selectKey == null) { // 클릭해서 선택한 날짜 id가 없다면
                           // 초기화면은 매월 1일 날짜 아이디값으로
    addData(inputVal, everyMonthDayId);
    showList(everyMonthDayId);
  } else {
    addData(inputVal, selectKey);
    showList(selectKey);
  }
  inputMemo.value = "";
  toggleBoxes(listBoxEle, inputBoxEle);
  keysCheckAndShow(); // 업데이트된 내역 보여주기
});

// 일정 추가 버튼 클릭시 이벤트
function addMemo() {
  if(document.getElementById("editForm").hidden === false){ // 수정창이 열려있다면 끄기
    document.getElementById("editInput").value = "";
    document.getElementById("editForm").hidden = true;
    if(selectKey != null) showList(selectKey);
    else showList(everyMonthDayId);
  }
  toggleBoxes(inputBoxEle, listBoxEle);
}

// storage 저장값 확인하여 등록한 메모 보여주기
function showList(memoKey) {
  // id값 타이틀에 보여주기
  var titleEle = document.getElementsByClassName("current-id");
  Array.from(titleEle).forEach(title => {
    title.innerText = memoKey;
  });
  // 메모리스트 리뉴얼
  var memoListEle = document.getElementById("memoList");
  memoListEle.hidden = false;
  memoListEle.innerHTML = ""; // 기존 목록 초기화
  var memoData = getData(memoKey);

  if (memoData.length > 0) {
    document.getElementById("memoAlarm").innerText = "";

    memoData.forEach(function (memo) {
      var listItem = document.createElement("li");
      var itemTitle = document.createElement("span");
      itemTitle.textContent = memo.content;
      // 삭제버튼
      var deleteButton = document.createElement("span");
      deleteButton.className = "delete-button";
      deleteButton.textContent = "🗑️";
      deleteButton.onclick = function () { // 데이터 삭제 버튼 이벤트
        deleteData(memo.id, memoKey);
        showList(memoKey);
        keysCheckAndShow();
      };
      // 수정버튼
      var editButton = document.createElement("span");
      editButton.className = "edit-button";
      editButton.textContent = "📝";
      editButton.onclick = function () { // 데이터 수정 버튼 이벤트
        editContent(memoKey, memo);
        memoListEle.hidden = true;
      };
      // 엘리멘트들 추가
      var divContainer = document.createElement("div");
      divContainer.appendChild(itemTitle);
      var br = document.createElement("br");
      divContainer.appendChild(br);
      divContainer.appendChild(editButton);
      divContainer.appendChild(deleteButton);
      listItem.appendChild(divContainer);
      memoListEle.appendChild(listItem);
    })
  } else {
    document.getElementById("memoAlarm").innerText = "등록된 메모가 없습니다.";
  }
  fontStyleSet(memoKey);
}

function editContent(memoKey, memo) {
  // element 가져오기
  var editFormEle = document.getElementById("editForm");
  editFormEle.hidden = false;
  // input박스에 기존 내용이 작성되어있어야함
  var editInput = document.getElementById("editInput");
  editInput.value = memo.content;
  // 취소 클릭 이벤트
  document.getElementById("editCancelBtn").onclick = function () {
    editInput.value = "";
    editFormEle.hidden = true;
    showList(memoKey);
  };
  // 컨펌 클릭 이벤트
  document.getElementById("editConfirmBtn").onclick = function () {
    var editContent = editInput.value;
    editData(memo.id, memoKey, editContent);
    editInput.value = "";
    editFormEle.hidden = true;
    showList(memoKey);
  };
}

// 날짜 셀 클릭 이벤트 (css, key저장, 이미 저장된 값이 있는지 없는지 확인 후 화면 전환)
function waitForClick() {
  for (var i = 0; i < cellElements.length; i++) { // 생성된 cellElements 각각에 click 이벤트 걸어주기
    cellElements[i].addEventListener("click", function (event) {
      selectKey = event.currentTarget.id; // 키값 변수에 id값 저장
      showList(selectKey);
    });
  }
}

function displayCalendar(year, month) {
  if (cellElements.length > 0) cellElements.length = 0; // 기존에 cell이 들어있으면 삭제

  var firstDay = new Date(year, month, 1); // 첫째날
  var lastDay = new Date(year, month + 1, 0); // 0은 이전달의 마지막날
  var daysInMonth = lastDay.getDate();

  yearEle.textContent = `${year}년`;
  monthEle.textContent = `${month + 1}월`;

  daysTableEle.innerHTML = ""; // 초기화

  var dayCounter = 1; // 1일부터 시작

  for (var i = 0; i < 6; i++) {
    var row = daysTableEle.insertRow(i);
    for (var j = 0; j < 7; j++) {
      var cell = row.insertCell(j);
      cell.setAttribute("class", "hover-element");
      if (
        (i === 0 && j < firstDay.getDay()) ||
        dayCounter > daysInMonth // 첫 번째 행의 시작 요일 이전이거나 현재 월의 일자를 초과하는 경우, 셀의 텍스트 내용을 비움
      ) {
        cell.textContent = "";
      } else {
        cell.textContent = dayCounter;
        // id 추가
        var cellId = `${year}-${month + 1}-${dayCounter}`;
        cell.setAttribute("id", cellId);

        if (cellId === currentDateId) cell.style.color = "blue"; // 현재날짜 표식
        if (dayCounter === 1) everyMonthDayId = cellId; // 매월 1일에 해당하는 id값 넣기

        cellElements.push(cell); // 모든 엘리먼트 배열에 넣기
        dayCounter++;
      }
    }
  }
  waitForClick();
  // 로컬스토리지 값 불러오기
  keysCheckAndShow();
}


// 선택된 엘리멘트 폰트스타일 설정
function fontStyleSet(eleId) {
  var selectEle = document.getElementById(eleId);
  if (preSelectEle == null) { // 처음 선택한거라면
    selectFontStyleSet(selectEle);
  } else { // 이전에 선택한 값이 있다면
    resetFontStyle(preSelectEle);
    selectFontStyleSet(selectEle);
  }
  preSelectEle = selectEle;
}

// 글씨 크게, 굵게
function selectFontStyleSet(ele) {
  ele.style.fontWeight = "bold";
}

// 글씨 스타일 초기화
function resetFontStyle(ele) {
  ele.style.fontWeight = "normal";
  ele.style.fontSize = "initial";
}

// 로컬스토리지에 등록된 키 가져와서 표식
function keysCheckAndShow() {
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    var ele = document.getElementById(key);
    if (ele !== null) {
      ele.style.position = 'relative';
      // 이미 dot이 있는지 확인
      var existingDot = ele.querySelector('.dot');
      // dot이 없다면 생성
      if (!existingDot) {
        var circle = document.createElement('span');
        circle.classList.add('dot');
        ele.appendChild(circle);
      }
    }
  }
}

function toggleBoxes(displayEle, hideEle) {
  displayEle.style.display = "block";
  hideEle.style.display = "none";
}

// 폰트 리뉴얼 함수 (안먹힘)
// function applyFontStyle() {
//   var dayCells = document.querySelectorAll("td");
//   dayCells.forEach(function (cell) {
//     // 현재 날짜
//     if(cell.id === currentDateId){
//       cell.style.color = "blue";
//       console.log(cell.id + "파란색");
//     }
//     // 선택한 날짜(없으면 1일날짜)
//     if(cell.id === selectKey || (selectKey == null && everyMonthDayId === cell.id)){
//       //cell.style = selectStyle;
//       cell.style.fontWeight = 'bold';
//       cell.style.fontSize = 'large';
//       console.log(cell.id + "진한색");
//     }
//     // 등록된 날짜
//     if(localStorage.getItem(cell.id) != null){
//       //cell.style = underStyle;
//       cell.style.textDecoration = 'underline';
//       console.log(cell.id + "밑줄");
//     }
//     else {
//       cell.style.color = "";
//       cell.style.fontWeight = "";
//       cell.style.fontSize = "";
//       cell.style.textDecoration = "";
//     }
//   });
// }
