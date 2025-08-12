// Test Coverage Visualizer
// Handles the visualization and interaction logic

class TestCoverageVisualizer {
  constructor() {
    this.currentView = 'tree';
    this.currentFilters = {
      coverage: 'all',
      testType: 'all'
    };
    this.selectedTest = null;
    this.zoomLevel = 1;
    this.minZoom = 0.3;
    this.maxZoom = 3;
    this.zoomStep = 0.1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateStats();
    this.renderTestList();
    this.renderVisualization();
  }

  setupEventListeners() {
    // View mode selector
    document.getElementById('viewMode').addEventListener('change', (e) => {
      this.currentView = e.target.value;
      this.renderVisualization();
    });

    // Coverage filter
    document.getElementById('filterCoverage').addEventListener('change', (e) => {
      this.currentFilters.coverage = e.target.value;
      this.renderTestList();
      this.renderVisualization();
    });

    // Test type filter
    document.getElementById('filterTest').addEventListener('change', (e) => {
      this.currentFilters.testType = e.target.value;
      this.renderTestList();
      this.renderVisualization();
    });

    // Mouse wheel zoom for tree view only (flow view uses D3 zoom)
    document.addEventListener('wheel', (e) => {
      if (this.currentView === 'tree' && e.ctrlKey) {
        e.preventDefault();
        const container = document.getElementById('treeVisualization');
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        console.log('Tree wheel event:', { mouseX, mouseY, deltaY: e.deltaY });
        
        if (e.deltaY < 0) {
          this.zoomInAtPoint(mouseX, mouseY);
        } else {
          this.zoomOutAtPoint(mouseX, mouseY);
        }
      }
    }, { passive: false });

    // Mouse panning for tree view only (flow view uses D3 zoom)
    const treeContainer = document.getElementById('treeVisualization');
    treeContainer.addEventListener('mousedown', (e) => {
      if (this.currentView === 'tree' && e.button === 0) { // Left mouse button
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        treeContainer.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.currentView === 'tree') {
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.panX += deltaX / this.zoomLevel;
        this.panY += deltaY / this.zoomLevel;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        console.log('Tree panning:', { deltaX, deltaY, panX: this.panX, panY: this.panY });
        
        this.applyCurrentViewTransform();
        e.preventDefault();
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        const treeContainer = document.getElementById('treeVisualization');
        treeContainer.style.cursor = 'grab';
      }
    });

    // Keyboard shortcuts for zoom (tree view only)
    document.addEventListener('keydown', (e) => {
      if (this.currentView === 'tree') {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          this.zoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          this.zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          this.resetZoom();
        }
      }
    });
  }

  updateStats() {
    const stats = testCoverageData.coverageAnalysis;
    
    document.getElementById('totalTests').textContent = this.getTotalTests();
    document.getElementById('fullCoverage').textContent = stats.fullyCovered;
    document.getElementById('partialCoverage').textContent = stats.partiallyCovered;
    document.getElementById('noCoverage').textContent = stats.notCovered;
  }

  getTotalTests() {
    return testCoverageData.testFiles.reduce((total, file) => total + file.tests.length, 0);
  }

  renderTestList() {
    const testList = document.getElementById('testList');
    testList.innerHTML = '';

    const filteredFiles = this.filterTestFiles();

    filteredFiles.forEach(testFile => {
      const fileItem = document.createElement('li');
      fileItem.className = 'test-item';
      fileItem.innerHTML = `
        <div class="test-name">${testFile.name}</div>
        <div class="test-coverage">${testFile.tests.length} tests</div>
      `;
      
      fileItem.addEventListener('click', () => {
        this.selectTestFile(testFile);
      });

      testList.appendChild(fileItem);
    });
  }

  filterTestFiles() {
    return testCoverageData.testFiles.filter(file => {
      if (this.currentFilters.testType !== 'all' && file.type !== this.currentFilters.testType) {
        return false;
      }

      if (this.currentFilters.coverage !== 'all') {
        const hasMatchingCoverage = file.tests.some(test => test.coverage === this.currentFilters.coverage);
        return hasMatchingCoverage;
      }

      return true;
    });
  }

  selectTestFile(testFile) {
    // Remove active class from all items
    document.querySelectorAll('.test-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to selected item
    event.target.closest('.test-item').classList.add('active');

    this.selectedTest = testFile;
    this.renderVisualization();
  }

  renderVisualization() {
    const container = document.getElementById('treeVisualization');
    container.innerHTML = '';

    console.log('Rendering visualization for view:', this.currentView);
    console.log('Test coverage data:', testCoverageData);

    // Show/hide zoom controls based on view
    const zoomControls = document.getElementById('zoomControls');
    zoomControls.style.display = (this.currentView === 'tree' || this.currentView === 'flow') ? 'flex' : 'none';

    // Reset zoom and pan when switching views
    if (this.currentView !== 'tree' && this.currentView !== 'flow') {
      this.resetZoom();
    }

    switch (this.currentView) {
      case 'tree':
        this.renderTreeView(container);
        break;
      case 'flow':
        this.renderFlowView(container);
        break;
      case 'coverage':
        this.renderCoverageHeatmap(container);
        break;
      default:
        console.error('Unknown view mode:', this.currentView);
        this.renderTreeView(container);
    }
  }

  zoomIn() {
    if (this.currentView === 'tree') {
      if (this.zoomLevel < this.maxZoom) {
        this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep);
        this.applyCurrentViewTransform();
      }
    } else if (this.currentView === 'flow' && this.currentSvg) {
      // For flow view, use D3 zoom
      const currentTransform = d3.zoomTransform(this.currentSvg.node());
      const newScale = Math.min(this.maxZoom, currentTransform.k + this.zoomStep);
      const newTransform = currentTransform.scale(newScale);
      this.currentSvg.transition().duration(300).call(
        d3.zoom().transform,
        newTransform
      );
    }
  }

  zoomOut() {
    if (this.currentView === 'tree') {
      if (this.zoomLevel > this.minZoom) {
        this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep);
        this.applyCurrentViewTransform();
      }
    } else if (this.currentView === 'flow' && this.currentSvg) {
      // For flow view, use D3 zoom
      const currentTransform = d3.zoomTransform(this.currentSvg.node());
      const newScale = Math.max(this.minZoom, currentTransform.k - this.zoomStep);
      const newTransform = currentTransform.scale(newScale);
      this.currentSvg.transition().duration(300).call(
        d3.zoom().transform,
        newTransform
      );
    }
  }

  zoomInAtPoint(mouseX, mouseY) {
    if (this.zoomLevel < this.maxZoom) {
      const oldZoom = this.zoomLevel;
      this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep);
      
      console.log('Zoom in:', { oldZoom, newZoom: this.zoomLevel, mouseX, mouseY, view: this.currentView });
      
      // Calculate new pan position for mouse-centered zoom
      const zoomFactor = this.zoomLevel / oldZoom;
      this.panX = mouseX - (mouseX - this.panX) * zoomFactor;
      this.panY = mouseY - (mouseY - this.panY) * zoomFactor;
      
      this.applyCurrentViewTransform();
    }
  }

  zoomOutAtPoint(mouseX, mouseY) {
    if (this.zoomLevel > this.minZoom) {
      const oldZoom = this.zoomLevel;
      this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep);
      
      console.log('Zoom out:', { oldZoom, newZoom: this.zoomLevel, mouseX, mouseY, view: this.currentView });
      
      // Calculate new pan position for mouse-centered zoom
      const zoomFactor = this.zoomLevel / oldZoom;
      this.panX = mouseX - (mouseX - this.panX) * zoomFactor;
      this.panY = mouseY - (mouseY - this.panY) * zoomFactor;
      
      this.applyCurrentViewTransform();
    }
  }

  resetZoom() {
    if (this.currentView === 'tree') {
      this.zoomLevel = 1;
      this.panX = 0;
      this.panY = 0;
      this.applyCurrentViewTransform();
    } else if (this.currentView === 'flow' && this.currentSvg) {
      // For flow view, use D3 zoom reset
      this.currentSvg.transition().duration(300).call(
        d3.zoom().transform,
        d3.zoomIdentity
      );
    }
  }

  applyZoom() {
    this.applyCurrentViewTransform();
  }

  applyCurrentViewTransform() {
    console.log('Applying transform for view:', this.currentView, { zoomLevel: this.zoomLevel, panX: this.panX, panY: this.panY });
    
    if (this.currentView === 'tree') {
      this.applyTransform();
    } else if (this.currentView === 'flow') {
      this.applyFlowTransform();
    }
  }

  applyTransform() {
    const container = document.getElementById('treeVisualization');
    const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
    
    // Handle tree view elements
    const elements = container.querySelectorAll('.mermaid, .simple-tree');
    elements.forEach(element => {
      element.style.transform = transform;
    });

    this.updateZoomDisplay();
    console.log('Applied tree transform:', transform);
  }

  applyFlowTransform() {
    if (this.currentG) {
      const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
      this.currentG.attr('transform', transform);
      
      this.updateZoomDisplay();
      console.log('Applied flow transform:', transform);
    } else {
      console.error('No currentG found for flow transform');
    }
  }

  updateZoomDisplay() {
    const zoomLevelElement = document.getElementById('zoomLevel');
    if (zoomLevelElement) {
      zoomLevelElement.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }
  }

  renderTreeView(container) {
    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    });

    const mermaidCode = this.generateMermaidTree();
    
    const mermaidDiv = document.createElement('div');
    mermaidDiv.className = 'mermaid';
    mermaidDiv.textContent = mermaidCode;
    container.appendChild(mermaidDiv);

    // Render the diagram
    mermaid.init(undefined, mermaidDiv).then(() => {
      console.log('Mermaid diagram rendered successfully');
      this.applyTransform(); // Apply current transform
    }).catch(error => {
      console.error('Error rendering Mermaid diagram:', error);
      // Fallback to simple tree view
      this.renderSimpleTreeView(container);
    });
  }

  generateMermaidTree() {
    let mermaidCode = 'graph TD\n';
    let nodeId = 0;

    const addNode = (node, parentId = null) => {
      const currentNodeId = `node${nodeId++}`;
      const coverage = this.getComponentCoverage(node.name);
      
      // Add node with proper escaping
      const nodeName = node.name.replace(/[^a-zA-Z0-9\s]/g, '');
      mermaidCode += `    ${currentNodeId}["${nodeName}"]:::${coverage}\n`;
      
      // Add connection to parent
      if (parentId) {
        mermaidCode += `    ${parentId} --> ${currentNodeId}\n`;
      }

      // Add children
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => addNode(child, currentNodeId));
      }
    };

    // Add style definitions first
    mermaidCode += '    classDef full fill:#d4edda,stroke:#28a745,stroke-width:2px\n';
    mermaidCode += '    classDef partial fill:#fff3cd,stroke:#ffc107,stroke-width:2px\n';
    mermaidCode += '    classDef none fill:#f8d7da,stroke:#dc3545,stroke-width:2px\n\n';

    // Build tree
    addNode(testCoverageData.appStructure);

    console.log('Generated Mermaid code:', mermaidCode);
    return mermaidCode;
  }

  renderSimpleTreeView(container) {
    console.log('Rendering simple tree view as fallback');
    
    const treeContainer = document.createElement('div');
    treeContainer.className = 'simple-tree';
    treeContainer.style.cssText = `
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;

    const renderNode = (node, level = 0) => {
      const nodeDiv = document.createElement('div');
      nodeDiv.style.cssText = `
        margin-left: ${level * 20}px;
        margin-bottom: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        border-left: 4px solid;
        background: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      `;

      const coverage = this.getComponentCoverage(node.name);
      const coverageColors = {
        full: { border: '#28a745', background: '#d4edda' },
        partial: { border: '#ffc107', background: '#fff3cd' },
        none: { border: '#dc3545', background: '#f8d7da' }
      };

      const colors = coverageColors[coverage] || coverageColors.none;
      nodeDiv.style.borderLeftColor = colors.border;
      nodeDiv.style.backgroundColor = colors.background;

      const nodeText = document.createElement('span');
      nodeText.textContent = node.name;
      nodeText.style.fontWeight = '600';
      nodeDiv.appendChild(nodeText);

      const coverageBadge = document.createElement('span');
      coverageBadge.textContent = coverage.toUpperCase();
      coverageBadge.style.cssText = `
        float: right;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 3px;
        background: ${colors.border};
        color: white;
        font-weight: bold;
      `;
      nodeDiv.appendChild(coverageBadge);

      treeContainer.appendChild(nodeDiv);

      if (node.children && node.children.length > 0) {
        node.children.forEach(child => renderNode(child, level + 1));
      }
    };

    renderNode(testCoverageData.appStructure);
    container.appendChild(treeContainer);
    this.applyTransform(); // Apply current transform
  }

  renderFlowView(container) {
    // Clear container
    container.innerHTML = '';

    const width = 1200;
    const height = 600;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', 'white')
      .style('border-radius', '8px')
      .style('box-shadow', '0 2px 10px rgba(0,0,0,0.1)')
      .style('overflow', 'hidden');

    // Create a zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        this.zoomLevel = event.transform.k;
        this.panX = event.transform.x;
        this.panY = event.transform.y;
        g.attr('transform', event.transform);
        this.updateZoomDisplay();
        console.log('D3 zoom event:', { k: event.transform.k, x: event.transform.x, y: event.transform.y });
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Create force simulation
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create data for flow diagram
    const flowData = this.createFlowData();

    // Create links
    const links = g.append('g')
      .selectAll('line')
      .data(flowData.links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Create nodes
    const nodes = g.append('g')
      .selectAll('circle')
      .data(flowData.nodes)
      .enter()
      .append('circle')
      .attr('r', d => d.size || 8)
      .attr('fill', d => this.getCoverageColor(d.coverage))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(flowData.nodes)
      .enter()
      .append('text')
      .text(d => d.name)
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.nodes(flowData.nodes).on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodes
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    simulation.force('link').links(flowData.links);
    
    // Store references for zoom handling
    this.currentSvg = svg;
    this.currentG = g;
    this.flowWidth = width;
    this.flowHeight = height;
    
    console.log('Flow view rendered with D3 zoom behavior');
    
    // Reset zoom state for flow view
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.updateZoomDisplay();
  }

  renderCoverageHeatmap(container) {
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create heatmap data
    const heatmapData = this.createHeatmapData();

    // Create scales
    const xScale = d3.scaleBand()
      .domain(heatmapData.xLabels)
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(heatmapData.yLabels)
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    const colorScale = d3.scaleLinear()
      .domain([0, 1, 2])
      .range(['#f8d7da', '#fff3cd', '#d4edda']);

    // Create heatmap cells
    svg.selectAll('rect')
      .data(heatmapData.data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.x))
      .attr('y', d => yScale(d.y))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
  }

  createFlowData() {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Add nodes from app structure
    function addNodes(node, parentId = null) {
      const nodeId = node.name.replace(/\s+/g, '_');
      
      if (!nodeMap.has(nodeId)) {
        nodeMap.set(nodeId, {
          id: nodeId,
          name: node.name,
          coverage: this.getComponentCoverage(node.name),
          size: node.children ? 12 : 8
        });
        nodes.push(nodeMap.get(nodeId));
      }

      if (parentId) {
        links.push({
          source: parentId,
          target: nodeId
        });
      }

      if (node.children) {
        node.children.forEach(child => addNodes.call(this, child, nodeId));
      }
    }

    addNodes.call(this, testCoverageData.appStructure);
    return { nodes, links };
  }

  createHeatmapData() {
    const testFiles = testCoverageData.testFiles;
    const components = this.getAllComponents();
    
    const xLabels = testFiles.map(file => file.name);
    const yLabels = components;
    
    const data = [];
    
    testFiles.forEach((file, fileIndex) => {
      components.forEach((component, componentIndex) => {
        const coverage = this.getComponentCoverageForTestFile(component, file);
        data.push({
          x: file.name,
          y: component,
          value: coverage === 'full' ? 2 : coverage === 'partial' ? 1 : 0
        });
      });
    });

    return { data, xLabels, yLabels };
  }

  getAllComponents() {
    const components = new Set();
    
    function collectComponents(node) {
      components.add(node.name);
      if (node.children) {
        node.children.forEach(collectComponents);
      }
    }

    collectComponents(testCoverageData.appStructure);
    return Array.from(components);
  }

  getComponentCoverage(componentName) {
    const coveredByTests = new Set();
    
    testCoverageData.testFiles.forEach(testFile => {
      testFile.tests.forEach(test => {
        if (test.coveredComponents.includes(componentName)) {
          coveredByTests.add(test.coverage);
        }
      });
    });

    if (coveredByTests.has('full')) return 'full';
    if (coveredByTests.has('partial')) return 'partial';
    return 'none';
  }

  getComponentCoverageForTestFile(componentName, testFile) {
    const test = testFile.tests.find(t => t.coveredComponents.includes(componentName));
    return test ? test.coverage : 'none';
  }

  getCoverageColor(coverage) {
    switch (coverage) {
      case 'full': return '#28a745';
      case 'partial': return '#ffc107';
      case 'none': return '#dc3545';
      default: return '#6c757d';
    }
  }


}

// Export functions
function exportData() {
  const data = {
    coverageAnalysis: testCoverageData.coverageAnalysis,
    testFiles: testCoverageData.testFiles,
    missingTests: testCoverageData.missingTests,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `test-coverage-report-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function refreshData() {
  // Recalculate coverage statistics
  calculateCoverageStats();
  
  // Reinitialize visualizer
  if (window.visualizer) {
    window.visualizer.updateStats();
    window.visualizer.renderTestList();
    window.visualizer.renderVisualization();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.visualizer = new TestCoverageVisualizer();
});
