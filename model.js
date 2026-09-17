// Pure calculation engine shared by the website and independent regression tests.
export const round=n=>Math.sign(n)*Math.floor(Math.abs(n)+0.5+1e-9);
export const valid=n=>typeof n==='number'&&Number.isFinite(n);
const sum=a=>a.reduce((x,y)=>x+y,0);
export const machines=[
 {type:'1',cost:35000,capacity:72000,maintenance:1800},
 {type:'2',cost:95000,capacity:120000,maintenance:2900},
 {type:'3',cost:38000,capacity:68000,maintenance:2100},
 {type:'4',cost:70000,capacity:95000,maintenance:2900},
 {type:'5',cost:28000,capacity:45000,maintenance:1300},
 {type:'6',cost:90000,capacity:110000,maintenance:2900}];
export const premises=[
 {id:'A',slots:1,rate:.3,rent:12000},{id:'B',slots:1,rate:.4,rent:10000},
 {id:'C',slots:1,rate:.3,rent:12000},{id:'D',slots:1,rate:.1,rent:17000},
 {id:'E',slots:2,rate:.2,rent:15000},{id:'F',slots:3,rate:.2,rent:16000}];
export function defaults(){return {
 start:{cash:null,losses:null,annual:null,rosterConfirmed:false,loanStatus:'unknown',loans:[],
 machines:[{id:'M1',type:'5',cost:28000,capacity:45000,maintenance:1300,depreciation:3500,accumulated:null,life:null}]},
 rules:{confirmed:false,price:2,milkPrice:20000,yield:20000,minMilk:1,minMarket:1000,salary:10000,bonus:.05,tax:.1,interest:.1,newLife:8,block:10000,forecast:410000,swing:.2,milkPolicy:'unknown',icePolicy:'spoil',costPolicy:'full'},
 options:[
 {name:'A',milk:2,request:40000,actual:40000,downside:30000,market:1000,openingMilk:0,openingMilkValue:0,retainMilk:0,retainIce:0,premises:[{...premises[3],production:40000,storage:null}],installations:{M1:'D'},purchases:[],loans:[]},
 {name:'B',milk:4,request:80000,actual:80000,downside:60000,market:3000,openingMilk:0,openingMilkValue:0,retainMilk:0,retainIce:0,premises:[{...premises[4],production:80000,storage:null}],installations:{M1:'E'},purchases:[{...machines[0],id:'N1',premise:'E'}],loans:[{id:'New 1',amount:40000,term:8,timing:'machines'}]}
 ],selection:'A',assumption:'Actual sales must cover committed milk, premises, marketing and finance costs. Expansion requires additional allocated sales.',verification:{actual:40000,request:40000,production:40000,milk:2,market:1000,cash:100000,losses:0,borrow:0,term:4,price:2}
};}
export function calculate(start,rules,option,actual=option.actual){
 const errors=[],missing=[];
 const need=(v,label,min=0)=>{if(!valid(v)){missing.push(label);return false;}if(v<min)errors.push(label+' must be at least '+min);return true;};
 const integer=(v,label)=>{if(valid(v)&&!Number.isInteger(v))errors.push(label+' must be a whole number');};
 need(start.cash,'Autumn closing cash');need(start.losses,'Autumn unused tax losses');
 if(!start.rosterConfirmed)missing.push('Confirm the autumn machine roster');
 if(start.loanStatus==='unknown')missing.push('Confirm autumn loans (none or registered)');
 if(start.loanStatus==='registered'&&start.loans.length===0)missing.push('Add the outstanding autumn loans');
 for(const key of ['price','milkPrice','yield','minMilk','minMarket','salary','bonus','tax','interest','newLife','block'])need(rules[key],'Rule '+key,['yield','newLife','block'].includes(key)?1:0);
 for(const key of ['bonus','tax','interest'])if(valid(rules[key])&&rules[key]>1)errors.push(key+' rate must be between 0 and 1');
 integer(rules.newLife,'New machine life');integer(rules.block,'Request block');
 need(option.milk,'Milk bought');need(option.request,'Sales request');need(actual,'Actual allocation');need(option.market,'Market investment');
 need(option.openingMilk,'Opening stored milk');need(option.openingMilkValue,'Opening milk value');
 integer(option.request,'Sales request');integer(actual,'Actual allocation');
 if(valid(option.request)&&valid(rules.block)&&option.request%rules.block!==0)errors.push('Sales request must use '+rules.block.toLocaleString()+'-unit blocks');
 if(valid(actual)&&valid(rules.block)&&actual%rules.block!==0)errors.push('Actual allocation must use '+rules.block.toLocaleString()+'-unit blocks');
 if(valid(option.milk)&&valid(rules.minMilk)&&option.milk<rules.minMilk)errors.push('Milk purchase is below the seasonal minimum');
 if(valid(option.market)&&valid(rules.minMarket)&&option.market<rules.minMarket)errors.push('Market investment is below the seasonal minimum');
 const allMachines=start.machines.map(m=>({...m,new:false,premise:option.installations[m.id]??''})).concat(option.purchases.map(m=>({...m,new:true,life:rules.newLife,depreciation:valid(m.cost)&&valid(rules.newLife)?m.cost/rules.newLife:null,accumulated:0})));
 const ids=allMachines.map(m=>m.id);if(new Set(ids).size!==ids.length)errors.push('Machine copy IDs must be unique');
 for(const m of allMachines){for(const key of ['cost','capacity','maintenance','depreciation','life','accumulated'])need(m[key],m.id+' '+key);integer(m.life,m.id+' remaining life');integer(m.capacity,m.id+' capacity');if(m.accumulated>m.cost)errors.push(m.id+' accumulated depreciation exceeds original cost');if(m.life===0&&m.premise)errors.push(m.id+' is expired and cannot operate');if(valid(m.life)&&valid(m.depreciation)&&valid(m.cost)&&valid(m.accumulated)&&Math.abs(m.cost-m.accumulated-m.life*m.depreciation)>1)errors.push(m.id+' remaining life and depreciation do not reconcile to book value');}
 const pids=option.premises.map(p=>p.id);if(new Set(pids).size!==pids.length)errors.push('Premise IDs must be unique');
 for(const m of allMachines)if(m.premise&&!pids.includes(m.premise))errors.push(m.id+' is installed in an unrented premise');
 for(const p of option.premises){for(const key of ['rent','rate','slots','production'])need(p[key],p.id+' '+key);integer(p.slots,p.id+' slots');integer(p.production,p.id+' production');const installed=allMachines.filter(m=>m.premise===p.id);if(valid(p.slots)&&installed.length>p.slots)errors.push(p.id+' has too many installed machines');if(valid(p.production)&&installed.every(m=>valid(m.life)&&valid(m.capacity))&&p.production>sum(installed.filter(m=>m.life>0).map(m=>m.capacity)))errors.push(p.id+' production exceeds working machine capacity');}
 const produced=option.premises.every(p=>valid(p.production))?sum(option.premises.map(p=>p.production)):null;
 if(valid(produced)&&produced>(option.openingMilk+option.milk)*rules.yield)errors.push('Insufficient milk for committed production');
 if(valid(produced)&&option.request>produced)errors.push('Sales requested exceed production');
 if(valid(actual)&&actual>option.request)errors.push('Actual sales exceed requested sales');
 if(valid(actual)&&valid(produced)&&actual>produced)errors.push('Actual sales exceed production');
 if(option.openingMilk===0&&option.openingMilkValue>0)errors.push('Opening milk value requires opening milk tons');
 if(rules.milkPolicy==='spoil'&&option.openingMilk>0)errors.push('Opening stored milk conflicts with the no-storage assumption');
 const existingLoans=start.loanStatus==='registered'?start.loans:[];
 const schedules=[];
 for(const loan of existingLoans){for(const k of ['original','balance','installment','remaining'])need(loan[k],loan.id+' '+k,k==='remaining'?1:0);integer(loan.remaining,loan.id+' remaining term');if(loan.balance>loan.original)errors.push(loan.id+' balance exceeds original loan');if(loan.remaining>8)errors.push(loan.id+' must finish by Year 3 autumn');if(valid(loan.installment)&&valid(loan.balance)&&valid(loan.remaining)&&Math.abs(loan.installment*loan.remaining-loan.balance)>loan.remaining)errors.push(loan.id+' remaining schedule does not reconcile to outstanding debt');if(valid(loan.balance)&&valid(loan.installment)&&valid(loan.remaining)){let balance=loan.balance;const rows=[];for(let i=0;i<loan.remaining;i++){const principal=Math.min(balance,i===loan.remaining-1?balance:round(loan.installment));const interest=round(balance*rules.interest);rows.push({season:5+i,opening:balance,principal,interest,closing:balance-principal});balance-=principal;}schedules.push({id:loan.id,rows,new:false});}}
 for(const loan of option.loans){need(loan.amount,loan.id+' amount');need(loan.term,loan.id+' term',1);integer(loan.term,loan.id+' term');if(loan.term>8)errors.push(loan.id+' loan term must be 1 to 8 seasons');if(!['machines','milk','market','end'].includes(loan.timing))missing.push(loan.id+' funding timing');if(valid(loan.amount)&&valid(loan.term)&&Number.isInteger(loan.term)&&loan.term>=1&&loan.term<=8){let balance=round(loan.amount);const rows=[];for(let i=0;i<loan.term;i++){const principal=Math.min(balance,i===loan.term-1?balance:round(loan.amount/loan.term));const interest=round(balance*rules.interest);rows.push({season:5+i,opening:balance,principal,interest,closing:balance-principal});balance-=principal;}schedules.push({id:loan.id,rows,new:true});}}
 if(new Set([...existingLoans,...option.loans].map(l=>l.id)).size!==existingLoans.length+option.loans.length)errors.push('Loan IDs must be unique');
 const unusedMilk=valid(produced)&&valid(rules.yield)&&valid(option.milk)&&valid(option.openingMilk)?Math.max(0,option.milk+option.openingMilk-produced/rules.yield):null;
 const unsold=valid(produced)&&valid(actual)?Math.max(0,produced-actual):null;
 let retainedMilk=0,retainedIce=0;
 if(rules.milkPolicy==='store'){need(option.retainMilk,'Milk retained');for(const p of option.premises)need(p.storage,p.id+' confirmed/estimated milk storage capacity');retainedMilk=option.retainMilk;if(valid(retainedMilk)&&valid(unusedMilk)&&retainedMilk>unusedMilk)errors.push('Retained milk exceeds unused milk');if(option.premises.every(p=>valid(p.storage))&&retainedMilk>sum(option.premises.map(p=>p.storage)))errors.push('Retained milk exceeds rented storage capacity');}
 if(rules.icePolicy==='store'){need(option.retainIce,'Ice cream retained');retainedIce=option.retainIce;if(retainedIce>unsold)errors.push('Retained ice cream exceeds unsold production');}
 if(rules.costPolicy==='inventory'&&rules.milkPolicy!=='store')errors.push('Inventory costing requires an explicit milk-storage assumption');
 // Unknown storage has no invented benefit: financial projection uses Year 1 full-purchase-cost estimate.
 if(missing.length)return {complete:false,missing:[...new Set(missing)],errors,produced,unusedMilk,unsold,schedules};
 const revenue=round(actual*rules.price),milkCash=round(option.milk*rules.milkPrice);
 const totalMilkValue=round(milkCash+option.openingMilkValue);
 const unitMilkValue=(option.openingMilk+option.milk)>0?totalMilkValue/(option.openingMilk+option.milk):0;
 const endingMilkValue=rules.milkPolicy==='store'?round(retainedMilk*unitMilkValue):rules.milkPolicy==='unknown'?null:0;
 const milkCost=rules.costPolicy==='inventory'?totalMilkValue-endingMilkValue:totalMilkValue;
 const maintenance=round(sum(allMachines.map(m=>m.maintenance)));
 const depreciation=round(sum(allMachines.map(m=>m.life>0?Math.min(m.depreciation,Math.max(0,m.cost-m.accumulated)):0)));
 const gross=revenue-milkCost-maintenance-depreciation;
 const productionPremises=option.premises.filter(p=>p.production>0);let allocated=0;
 const transportRows=productionPremises.map((p,i)=>{const sold=i===productionPremises.length-1?actual-allocated:round(actual*p.production/produced);allocated+=sold;return {id:p.id,production:p.production,sold,rate:p.rate,unrounded:sold*p.rate};});
 const transport=round(sum(transportRows.map(p=>p.unrounded)));
 const market=round(option.market),salary=round(rules.salary),bonus=round(Math.max(0,gross)*rules.bonus),rent=round(sum(option.premises.map(p=>p.rent)));
 const interest=sum(schedules.map(l=>l.rows[0]?.interest??0)),principal=sum(schedules.map(l=>l.rows[0]?.principal??0));
 const pbt=gross-transport-market-bonus-salary-rent-interest;
 const lossUsed=Math.min(Math.max(0,pbt),round(start.losses)),taxable=Math.max(0,pbt-lossUsed),tax=round(taxable*rules.tax),net=pbt-tax;
 const closingLosses=round(start.losses)-lossUsed+Math.max(0,-pbt);
 const purchases=round(sum(option.purchases.map(m=>m.cost)));
 const funds=stage=>round(sum(option.loans.filter(l=>l.timing===stage).map(l=>l.amount)));
 let cash=round(start.cash);const timing=[];
 for(const [stage,label,payment] of [['machines','Machine purchases',purchases],['milk','Milk purchase',milkCash],['market','Market investment',market]]){const opening=cash,borrowing=funds(stage);cash+=borrowing;const before=cash;cash-=payment;timing.push({stage,label,opening,borrowing,before,payment,after:cash});if(before<0||cash<0)errors.push('Negative cash at '+label.toLowerCase());}
 const beforeEnd=cash+revenue+funds('end');
 const endPayments=rent+maintenance+transport+salary+bonus+principal+interest+tax;
 const closingCash=beforeEnd-endPayments;
 if(closingCash<0)errors.push('Negative season-end closing cash');
 const openingDebt=round(sum(existingLoans.map(l=>l.balance))),newBorrowing=round(sum(option.loans.map(l=>l.amount))),closingDebt=openingDebt+newBorrowing-principal;
 return {complete:true,missing:[],errors,produced,actual,revenue,milkCash,milkCost,maintenance,depreciation,gross,transport,transportRows,market,salary,bonus,rent,interest,principal,pbt,lossUsed,taxable,tax,net,closingLosses,purchases,timing,beforeEnd,endPayments,closingCash,openingDebt,newBorrowing,closingDebt,unusedMilk,unsold,retainedMilk:rules.milkPolicy==='unknown'?null:retainedMilk,milkSpoiled:rules.milkPolicy==='unknown'?null:unusedMilk-retainedMilk,iceSpoiled:rules.icePolicy==='unknown'?null:unsold-retainedIce,endingMilkValue,schedules,machines:allMachines.map(m=>({...m,closingLife:Math.max(0,m.life-1),closingBook:round(Math.max(0,m.cost-m.accumulated-(m.life>0?m.depreciation:0)))}))};
}
export function verificationInputs(v=defaults().verification){
 const d=defaults();const start={cash:v.cash,losses:v.losses,annual:0,rosterConfirmed:true,loanStatus:'none',loans:[],machines:[]};
 const rules={...d.rules,price:v.price,milkPolicy:'spoil',icePolicy:'spoil',confirmed:true};
 const option={...d.options[0],milk:v.milk,request:v.request,actual:v.actual,market:v.market,premises:[{...premises[3],production:v.production,storage:0}],purchases:[{...machines[4],id:'Winter M5',premise:'D'}],loans:v.borrow>0?[{id:'Verification loan',amount:v.borrow,term:v.term,timing:'machines'}]:[]};return {start,rules,option};
}
export function verify(v){const x=verificationInputs(v);return calculate(x.start,x.rules,x.option);}
