var fs = require('fs');


function readInput() {
  var text = fs.readFileSync(__dirname + '/../input.txt', 'utf8');
  var lines = text.split(/\r?\n/);
  var result = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line !== '') {
      result.push(line);
    }
  }
  return result;
}


function parseData(lines) {
  var sep = -1;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i] === '---') {
      sep = i;
      break;
    }
  }
  if (sep < 0) {
    throw new Error('Không tìm thấy dòng --- trong input.txt');
  }

  var graph = {};
  for (var j = 0; j < sep; j++) {
    var parts = lines[j].split(/\s+/);
    var node = parts[0];
    var neighbors = [];
    for (var k = 1; k < parts.length; k++) {
      neighbors.push(parts[k]);
    }
    graph[node] = neighbors;
  }

  var heuristics = {};
  for (var j = sep + 1; j < lines.length; j++) {
    var parts = lines[j].split(/\s+/);
    if (parts.length >= 2) {
      heuristics[parts[0]] = parseInt(parts[1], 10);
    }
  }

  return {
    graph: graph,
    heuristics: heuristics,
  };
}


function formatNeighborList(neighbors, heuristics) {
  if (neighbors.length === 0) {
    return 'Không có';
  }
  var parts = [];
  for (var i = 0; i < neighbors.length; i++) {
    var node = neighbors[i];
    parts.push(node + '(' + heuristics[node] + ')');
  }
  var text = parts[0];
  for (var j = 1; j < parts.length; j++) {
    text = text + ', ' + parts[j];
  }
  return text;
}


function findBestNeighbor(current, neighbors, heuristics) {
  var best = null;
  for (var i = 0; i < neighbors.length; i++) {
    var node = neighbors[i];
    if (best === null || heuristics[node] < heuristics[best]) {
      best = node;
    }
  }
  return best;
}


function hillClimbing(graph, heuristics) {
  var current = 'A';
  var goal = 'B';
  var path = [current];
  var logs = [];
  var step = 1;

  while (true) {
    var neighbors = graph[current] || [];
    var neighborText = formatNeighborList(neighbors, heuristics);
    var best = findBestNeighbor(current, neighbors, heuristics);
    var chosen = 'Không đi tiếp';

    if (best !== null && heuristics[best] < heuristics[current]) {
      chosen = best;
      logs.push(step + ' | ' + current + '(' + heuristics[current] + ') | ' + neighborText + ' | ' + chosen);
      current = best;
      path.push(current);
      step = step + 1;
      if (current === goal) {
        break;
      }
    } else {
      logs.push(step + ' | ' + current + '(' + heuristics[current] + ') | ' + neighborText + ' | ' + chosen);
      break;
    }
  }

  var result = 'Thất bại do kẹt tại cực trị địa phương';
  if (current === goal) {
    result = 'Tìm thấy đích B';
  }

  return {
    logs: logs,
    path: path,
    result: result,
  };
}


var lines = readInput();
var data = parseData(lines);
var result = hillClimbing(data.graph, data.heuristics);

var output = '';
output = output + 'Bảng từng bước:\n';
output = output + 'Bước | Đỉnh hiện tại | Các đỉnh kề | Chọn đỉnh\n';
for (var i = 0; i < result.logs.length; i++) {
  output = output + result.logs[i] + '\n';
}
output = output + '\nĐường đi: ' + result.path.join(' -> ') + '\n\n';
output = output + result.result;

fs.writeFileSync(__dirname + '/../output.txt', output, 'utf8');
console.log('Đã tạo output.txt ở thư mục gốc.');
