#!/usr/bin/env python3
"""Swap CBA section to appear before Performance Analytics in index.html"""

filepath = '/home/jun/FYDP D simulations/Webots_new/showcase/index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find key line numbers (0-indexed)
cba_start = None
perf_header_start = None  # "Performance Analytics" header
bubble_chart_end = None

for i, line in enumerate(lines):
    if '<!-- ─── Cost-Benefit Analysis (under Analytics) ─── -->' in line:
        cba_start = i
    if '<h2>Performance Analytics</h2>' in line and cba_start is None:
        # The Performance Analytics header div starts one line before
        perf_header_start = i - 1  # the <div class="section-header"> line
    if 'costVsPerformanceChart' in line and cba_start is not None:
        # Find closure after this canvas
        for j in range(i, min(i+10, len(lines))):
            if '</div>' in lines[j] and '</div>' in lines[j+1]:
                bubble_chart_end = j + 2  # include both closing divs
                break
        if bubble_chart_end is None:
            bubble_chart_end = i + 5

print(f"CBA start: line {cba_start+1}")
print(f"Perf header: line {perf_header_start+1}")
print(f"Bubble chart end: line {bubble_chart_end+1}")

# The CBA block is from cba_start to bubble_chart_end (exclusive)
cba_block = lines[cba_start:bubble_chart_end]

# Remove CBA block from its current position
new_lines = lines[:cba_start] + lines[bubble_chart_end:]

# Now find where to insert - right after the analytics section opens
# The section opens at: <section id="analytics"...> -> <div class="container">
# We want to insert before "Performance Analytics" header
insert_idx = None
for i, line in enumerate(new_lines):
    if '<h2>Performance Analytics</h2>' in line:
        insert_idx = i - 1  # before <div class="section-header">
        break

print(f"Insert at: line {insert_idx+1}")

# Add Performance Analytics header+ charts after the CBA block
# We need to add the charts that were originally before CBA
perf_analytics_block = [
        '\n',
        '        <!-- ─── Performance Analytics ─── -->\n',
        '        <div class="section-header" style="margin-top:80px;">\n',
        '            <h2>Performance Analytics</h2>\n',
        '            <p>Visual breakdown of power, data, and sensor characteristics</p>\n',
        '        </div>\n',
        '        <div class="charts-grid">\n',
        '            <div class="chart-card">\n',
        '                <h3>⚡ Power Consumption Breakdown (W)</h3>\n',
        '                <canvas id="powerChart"></canvas>\n',
        '            </div>\n',
        '            <div class="chart-card">\n',
        '                <h3>📊 Point Cloud &amp; Data Comparison</h3>\n',
        '                <canvas id="pointsChart"></canvas>\n',
        '            </div>\n',
        '        </div>\n',
]

# Remove the original Performance Analytics header and charts (lines insert_idx to insert_idx+12ish)
# Find end of original charts block
charts_end = None
for i in range(insert_idx, min(insert_idx + 20, len(new_lines))):
    if '</div>' in new_lines[i] and 'charts-grid' not in new_lines[i]:
        # Check if this is the closing </div> of charts-grid
        if i > insert_idx + 5:
            charts_end = i + 1
            break

# Actually let's find it more precisely - look for the MATLAB section header
matlab_start = None
for i in range(insert_idx, min(insert_idx + 30, len(new_lines))):
    if 'MATLAB Simulated Results' in new_lines[i]:
        matlab_start = i - 2  # <div class="section-header"...> line
        break

print(f"MATLAB starts at: line {matlab_start+1}")

# Original performance analytics section = insert_idx to matlab_start
original_perf = new_lines[insert_idx:matlab_start]
print(f"Original perf section ({len(original_perf)} lines):")
for l in original_perf[:5]:
    print(f"  {l.rstrip()}")

# Build final: everything before insert_idx + CBA block + perf_analytics_block + everything from matlab_start onwards
final_lines = new_lines[:insert_idx] + cba_block + perf_analytics_block + new_lines[matlab_start:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print(f"\nDone! Total lines: {len(final_lines)}")
