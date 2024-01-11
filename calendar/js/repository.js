/** data CRUD **/

// 데이터 틀 정의
function createDataTemplate(id, content) {
  return {id: id, content: content};
}

// 데이터 가져오기
function getData(dataKey) {
  var existingData = localStorage.getItem(dataKey);
  return existingData ? JSON.parse(existingData) : [];
}

// 데이터 추가하기
function addData(content, dataKey) {
  var data = getData(dataKey);
  // 마지막 메모의 id값 확인하여 자동부여
  var lastId = data.length > 0 ? data[data.length - 1].id : 0;
  var nextId = lastId + 1;
  data.push(createDataTemplate(nextId, content));
  localStorage.setItem(dataKey, JSON.stringify(data));
}

// 데이터 삭제하기
function deleteData(id, dataKey) {
  var targetData = getData(dataKey);
  if(targetData.length>1) {
    var data = targetData.filter(item => item.id !== id);
    localStorage.setItem(dataKey, JSON.stringify(data));
  }
  else { // 1개의 데이터만 남아있었을 경우 아예 삭제
    removeDotForKey(dataKey);
    localStorage.removeItem(dataKey);
  }
}

// 데이터 수정하기
function editData(id, dataKey, content){
  var data = getData(dataKey);
  var updatedData = data.map(function (item) {
    if(item.id === id) item.content = content;
    return item;
  });
  localStorage.setItem(dataKey, JSON.stringify(updatedData));
}



// 모든 일정이 삭제되었을때 호출 (점제거)
function removeDotForKey(key) {
  var ele = document.getElementById(key);
  if (ele !== null) {
    var existingDot = ele.querySelector('.dot');
    // dot이 있으면 제거
    if (existingDot) {
      existingDot.remove();
    }
  }
}
