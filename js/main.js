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
    var best = findBestNeighbor(current, neighbors, heuristics);
    
    // Kiểm tra nếu best đã được ghé qua rồi (tránh vòng lặp)
    var isInPath = false;
    if (best !== null) {
      for (var idx = 0; idx < path.length; idx++) {
        if (path[idx] === best) {
          isInPath = true;
          break;
        }
      }
    }

    // Tìm hàng xóm chưa ghé qua
    var unvisitedNeighbors = [];
    for (var i = 0; i < neighbors.length; i++) {
      var isVisited = false;
      for (var j = 0; j < path.length; j++) {
        if (path[j] === neighbors[i]) {
          isVisited = true;
          break;
        }
      }
      if (!isVisited) {
        unvisitedNeighbors.push(neighbors[i]);
      }
    }

    // Sắp xếp L1: hàng xóm chưa ghé qua theo heuristic
    var L1 = [];
    for (var k = 0; k < unvisitedNeighbors.length; k++) {
      L1.push(unvisitedNeighbors[k]);
    }
    L1.sort(function(a, b) {
      return heuristics[a] - heuristics[b];
    });

    // Tìm tất cả các node kề được từ tất cả node trong path
    var allNeighborsFromPath = [];
    for (var pathIdx = 0; pathIdx < path.length; pathIdx++) {
      var pathNode = path[pathIdx];
      var pathNodeNeighbors = graph[pathNode] || [];
      for (var pni = 0; pni < pathNodeNeighbors.length; pni++) {
        var neighbor = pathNodeNeighbors[pni];
        // Kiểm tra xem neighbor đã có trong allNeighborsFromPath chưa
        var alreadyExists = false;
        for (var aei = 0; aei < allNeighborsFromPath.length; aei++) {
          if (allNeighborsFromPath[aei] === neighbor) {
            alreadyExists = true;
            break;
          }
        }
        if (!alreadyExists) {
          allNeighborsFromPath.push(neighbor);
        }
      }
    }

    // Sắp xếp L: node kề từ path nhưng chưa ghé qua, theo heuristic
    var L = [];
    for (var anIdx = 0; anIdx < allNeighborsFromPath.length; anIdx++) {
      var neighborNode = allNeighborsFromPath[anIdx];
      var isVisited = false;
      for (var vIdx = 0; vIdx < path.length; vIdx++) {
        if (path[vIdx] === neighborNode) {
          isVisited = true;
          break;
        }
      }
      if (!isVisited) {
        L.push(neighborNode);
      }
    }
    L.sort(function(a, b) {
      return heuristics[a] - heuristics[b];
    });

    // Format L1 và L
    var L1Text = '';
    for (var l1i = 0; l1i < L1.length; l1i++) {
      if (l1i > 0) L1Text += ', ';
      L1Text += L1[l1i] + heuristics[L1[l1i]];
    }

    var LText = '';
    for (var li = 0; li < L.length; li++) {
      if (li > 0) LText += ', ';
      LText += L[li] + heuristics[L[li]];
    }

    // Neighbors text
    var neighborsText = '';
    for (var ni = 0; ni < neighbors.length; ni++) {
      if (ni > 0) neighborsText += ', ';
      neighborsText += neighbors[ni] + heuristics[neighbors[ni]];
    }

    logs.push({
      node: current,
      heuristic: heuristics[current],
      neighbors: neighborsText,
      L1: L1Text,
      L: LText
    });

    // choic l
    if (best !== null && !isInPath) {
      current = best;
      path.push(current);
      step = step + 1;
      // Nếu đã đạt đích, dừng
      if (current === goal) {
        break;
      }
    } else {
      break;
    }
  }

  // Nếu đạt được đích, thêm dòng cho node B
  if (current === goal) {
    // Tìm tất cả node kề được từ path cuối cùng
    var finalNeighbors = graph[current] || [];
    var finalNeighborsText = '';
    for (var fni = 0; fni < finalNeighbors.length; fni++) {
      if (fni > 0) finalNeighborsText += ', ';
      finalNeighborsText += finalNeighbors[fni] + heuristics[finalNeighbors[fni]];
    }

    // Tìm tất cả node kề được từ path
    var finalAllNeighborsFromPath = [];
    for (var fpIdx = 0; fpIdx < path.length; fpIdx++) {
      var fpNode = path[fpIdx];
      var fpNodeNeighbors = graph[fpNode] || [];
      for (var fpni = 0; fpni < fpNodeNeighbors.length; fpni++) {
        var fpNeighbor = fpNodeNeighbors[fpni];
        var falreadyExists = false;
        for (var faei = 0; faei < finalAllNeighborsFromPath.length; faei++) {
          if (finalAllNeighborsFromPath[faei] === fpNeighbor) {
            falreadyExists = true;
            break;
          }
        }
        if (!falreadyExists) {
          finalAllNeighborsFromPath.push(fpNeighbor);
        }
      }
    }

    // Sắp xếp L cho node B
    var finalL = [];
    for (var fanIdx = 0; fanIdx < finalAllNeighborsFromPath.length; fanIdx++) {
      var fneighborNode = finalAllNeighborsFromPath[fanIdx];
      var fisVisited = false;
      for (var fvIdx = 0; fvIdx < path.length; fvIdx++) {
        if (path[fvIdx] === fneighborNode) {
          fisVisited = true;
          break;
        }
      }
      if (!fisVisited) {
        finalL.push(fneighborNode);
      }
    }
    finalL.sort(function(a, b) {
      return heuristics[a] - heuristics[b];
    });

    var finalLText = '';
    for (var fli = 0; fli < finalL.length; fli++) {
      if (fli > 0) finalLText += ', ';
      finalLText += finalL[fli] + heuristics[finalL[fli]];
    }

    logs.push({
      node: current,
      heuristic: heuristics[current],
      neighbors: 'TTKT-Dung-',
      L1: '',
      L: finalLText
    });
  }

  var result = 'TTKT-Dung';
  if (current === goal) {
    result = 'Tìm thấy đích B';
  }

  return {
    logs: logs,
    path: path,
    result: result,
  };
}


function padRight(str, len) {
  var s = str.toString();
  while (s.length < len) {
    s = s + ' ';
  }
  return s;
}

var lines = readInput();
var data = parseData(lines);
var result = hillClimbing(data.graph, data.heuristics);

var output = '';
output = output + 'Node  h(n)    Neighbors           L1 (sorted)         L\n';
output = output + '---------------------------------------------------------------------------\n';
for (var i = 0; i < result.logs.length; i++) {
  var log = result.logs[i];
  var nodeStr = log.node;
  var hStr = log.heuristic.toString();
  var neighborsStr = log.neighbors || 'Không có';
  var L1Str = (log.L1 !== undefined && log.L1 !== null) ? log.L1 : '-';
  var LStr = (log.L !== undefined && log.L !== null) ? log.L : '-';
  
  // Padding for columns
  output = output + padRight(nodeStr, 6) + padRight(hStr, 8) + padRight(neighborsStr, 20) + padRight(L1Str, 20) + LStr + '\n';
}
output = output + '\nĐường đi: ' + result.path.join(' -> ') + '\n';
output = output + '\nKết quả: ' + result.result;

fs.writeFileSync(__dirname + '/../output.txt', output, 'utf8');
console.log('Đã tạo output.txt ở thư mục gốc.');
