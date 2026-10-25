/* Accessible visuals for original Academic Writing prompts. */
function taskVisual(t){
  if(t.chart)return chartHTML(t.chart);
  if(t.process){const p=t.process;return `<figure class="task-process"><figcaption>${esc(p.title)}</figcaption><ol>${p.stages.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${p.note?`<p class="small">${esc(p.note)}</p>`:''}</figure>`}
  if(t.plans){const p=t.plans;return `<figure class="task-plans"><figcaption>${esc(p.title)}</figcaption><div class="plan-pair">${[p.before,p.after].map(plan=>`<div><h3>${esc(plan.label)}</h3><p class="small">↑ North</p><div class="plan-grid" role="img" aria-label="${esc(plan.label+': '+plan.cells.join(', '))}">${plan.cells.map(c=>`<div>${esc(c)}</div>`).join('')}</div></div>`).join('')}</div><p class="small">${esc(p.note)}</p></figure>`}
  return '';
}
function taskVisualText(t){
  if(t.chart){const c=t.chart;return `${c.title} (${c.unit})\n${c.labels.join(' | ')}\n${c.series.map(s=>s.name+': '+s.values.map(v=>v+(c.suffix??'%')).join(' | ')).join('\n')}`}
  if(t.process)return t.process.title+'\n'+t.process.stages.map((s,i)=>(i+1)+'. '+s).join('\n')+'\n'+(t.process.note||'');
  if(t.plans)return [t.plans.title,...[t.plans.before,t.plans.after].map(p=>p.label+':\n'+[0,3,6].map(i=>p.cells.slice(i,i+3).join(' | ')).join('\n')),t.plans.note].join('\n');
  return '';
}
chartHTML=function(c){
  const suffix=c.suffix??'%',max=Math.max(1,...c.series.flatMap(s=>s.values)),colors=['#7957d5','#c97cba','#ecad77'],kind=c.kind||'bar';
  const table=`<div class="chart-table-wrap"><table><caption>${esc(c.title)} · ${esc(c.unit)}</caption><thead><tr><th scope="col">${esc(c.categoryLabel||'Category')}</th>${c.labels.map(l=>`<th scope="col">${esc(l)}</th>`).join('')}</tr></thead><tbody>${c.series.map(s=>`<tr><th scope="row">${esc(s.name)}</th>${s.values.map(v=>`<td>${v}${esc(suffix)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if(kind==='table')return `<figure class="chart task-chart">${table}</figure>`;
  let plot='';
  if(kind==='line'){
    const x=i=>55+i*490/Math.max(1,c.labels.length-1),y=v=>220-v/max*180;
    plot=`<svg class="line-chart" viewBox="0 0 600 280" role="img" aria-label="${esc(c.title+'. Exact values appear in the table below.')}">${[0,.25,.5,.75,1].map(n=>`<path d="M55 ${y(n*max)}H545" stroke="#e6d7ef"/><text x="45" y="${y(n*max)+4}" text-anchor="end">${Math.round(max*n*10)/10}${esc(suffix)}</text>`).join('')}${c.series.map((s,i)=>`<polyline fill="none" stroke="${colors[i%3]}" stroke-width="3" points="${s.values.map((v,k)=>x(k)+','+y(v)).join(' ')}"/>${s.values.map((v,k)=>`<circle cx="${x(k)}" cy="${y(v)}" r="4" fill="${colors[i%3]}"/>`).join('')}`).join('')}${c.labels.map((l,i)=>`<text x="${x(i)}" y="250" text-anchor="middle">${esc(l)}</text>`).join('')}</svg>`;
  }else{
    plot=`<div class="chart-bars" aria-hidden="true">${c.labels.map((l,i)=>`<div class="chart-group">${c.series.map((s,k)=>`<i style="height:${s.values[i]/max*100}%;background:${colors[k%3]}"></i>`).join('')}<span>${esc(l)}</span></div>`).join('')}</div>`;
  }
  return `<figure class="chart task-chart"><h3>${esc(c.title)}</h3><p class="small muted">${esc(c.unit)}</p>${plot}<div class="legend">${c.series.map((s,i)=>`<span><b style="background:${colors[i%3]}"></b>${esc(s.name)}</span>`).join('')}</div>${table}</figure>`;
};
