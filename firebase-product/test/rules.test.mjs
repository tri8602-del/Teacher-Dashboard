// Product-project Firestore rules tests (emulator only, project demo-tdp). Simulated data only.
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc,updateDoc,deleteDoc,collection,collectionGroup,getDocs,serverTimestamp,query,where} from 'firebase/firestore';
import fs from 'fs';
const rules=fs.readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
const env=await initializeTestEnvironment({projectId:'demo-tdp',firestore:{rules,host:'127.0.0.1',port:8285}});
const R=[];const t=async(name,p)=>{try{await p;R.push([name,true]);console.log('PASS',name)}catch(e){R.push([name,false]);console.log('FAIL',name,'::',String(e.message||e).slice(0,200))}};
await env.clearFirestore();
const A=env.authenticatedContext('teacherA').firestore(),B=env.authenticatedContext('teacherB').firestore(),U=env.unauthenticatedContext().firestore();
const rec=(uid,extra={})=>({dataJson:JSON.stringify({profile:'teacher',students:[{id:'s1',name:'Sim Student'}]}),ownerUid:uid,updatedAt:new Date().toISOString(),appVersion:'4.14.0',revision:1,...extra});
const mainA=db=>doc(db,'users/teacherA/dashboards/main'),mainB=db=>doc(db,'users/teacherB/dashboards/main');
// own data
await t('A creates own dashboard',assertSucceeds(setDoc(mainA(A),rec('teacherA'))));
await t('A reads own dashboard',assertSucceeds(getDoc(mainA(A))));
await t('A updates own dashboard',assertSucceeds(setDoc(mainA(A),rec('teacherA',{revision:2}))));
await t('A lists own dashboards folder',assertSucceeds(getDocs(collection(A,'users/teacherA/dashboards'))));
await t('B creates own dashboard',assertSucceeds(setDoc(mainB(B),rec('teacherB'))));
// cross-teacher
await t('B cannot read A dashboard',assertFails(getDoc(mainA(B))));
await t('B cannot list A dashboards folder',assertFails(getDocs(collection(B,'users/teacherA/dashboards'))));
await t('B cannot overwrite A dashboard',assertFails(setDoc(mainA(B),rec('teacherB'))));
await t('B cannot overwrite A dashboard even claiming ownerUid=A',assertFails(setDoc(mainA(B),rec('teacherA'))));
await t('B cannot update a field of A dashboard',assertFails(updateDoc(mainA(B),{dataJson:'{}'})));
await t('B cannot delete A dashboard',assertFails(deleteDoc(mainA(B))));
await t('B cannot create a new doc in A folder',assertFails(setDoc(doc(B,'users/teacherA/dashboards/calcScan_x1'),{dataUrl:'data:,',type:'image/png',name:'x',calculatorId:'c',ownerUid:'teacherA',updatedAt:'now'})));
await t('B cannot query the users collection',assertFails(getDocs(query(collection(B,'users'),where('ownerUid','==','teacherA')))));
await t('B cannot search every teacher dashboard (collection group)',assertFails(getDocs(collectionGroup(B,'dashboards'))));
await t('B cannot collection-group search for A by ownerUid',assertFails(getDocs(query(collectionGroup(B,'dashboards'),where('ownerUid','==','teacherA')))));
// unauthenticated
await t('signed-out cannot read A dashboard',assertFails(getDoc(mainA(U))));
await t('signed-out cannot write A dashboard',assertFails(setDoc(mainA(U),rec('teacherA'))));
await t('signed-out cannot create any dashboard',assertFails(setDoc(doc(U,'users/nobody/dashboards/main'),rec('nobody'))));
await t('signed-out cannot list users',assertFails(getDocs(collection(U,'users'))));
await t('signed-out cannot write random collection',assertFails(setDoc(doc(U,'anything/x'),{a:1})));
// shape checks on own data
await t('A cannot save dashboard owned by someone else (ownerUid=B)',assertFails(setDoc(mainA(A),rec('teacherB'))));
await t('A cannot add unknown fields to dashboard',assertFails(setDoc(mainA(A),rec('teacherA',{isAdmin:true}))));
await t('A cannot write users/teacherA root doc',assertFails(setDoc(doc(A,'users/teacherA'),{x:1})));
await t('A cannot write other top-level collections',assertFails(setDoc(doc(A,'shared/x'),{ownerUid:'teacherA'})));
await t('A can save own calculator scan',assertSucceeds(setDoc(doc(A,'users/teacherA/dashboards/calcScan_abc'),{dataUrl:'data:,',type:'image/png',name:'s',calculatorId:'c1',ownerUid:'teacherA',updatedAt:'now'})));
await t('A can delete own scan',assertSucceeds(deleteDoc(doc(A,'users/teacherA/dashboards/calcScan_abc'))));
await t('A cannot write odd doc names in own folder',assertFails(setDoc(doc(A,'users/teacherA/dashboards/other'),rec('teacherA'))));
// contracts
const tok='T'.repeat(40);const ack={ownerUid:'teacherA',calculatorId:'c1',outId:'o1',createdAt:'now',contract:{studentName:'Sim'},signed:false,signerName:'',agreed:false,signedAt:null};
await t('A creates own contract',assertSucceeds(setDoc(doc(A,'calcAcks',tok),ack)));
await t('B cannot create contract as A',assertFails(setDoc(doc(B,'calcAcks','U'.repeat(40)),ack)));
await t('nobody can list contracts (B)',assertFails(getDocs(collection(B,'calcAcks'))));
await t('nobody can list contracts (signed-out)',assertFails(getDocs(collection(U,'calcAcks'))));
await t('B cannot change or take A contract',assertFails(updateDoc(doc(B,'calcAcks',tok),{ownerUid:'teacherB'})));
await t('B cannot delete A contract',assertFails(deleteDoc(doc(B,'calcAcks',tok))));
await t('parent with exact link can read that contract',assertSucceeds(getDoc(doc(U,'calcAcks',tok))));
await t('parent can sign once',assertSucceeds(updateDoc(doc(U,'calcAcks',tok),{signed:true,agreed:true,signerName:'Sim Parent',signedAt:serverTimestamp()})));
await t('parent cannot sign again',assertFails(updateDoc(doc(U,'calcAcks',tok),{signerName:'Changed',signedAt:serverTimestamp()})));
await t('short token cannot be read',assertFails(getDoc(doc(U,'calcAcks','short'))));
// verify A data untouched by B attempts
let snap;await env.withSecurityRulesDisabled(async c=>{snap=(await getDoc(doc(c.firestore(),'users/teacherA/dashboards/main'))).data();});
await t('A dashboard still A after all attempts',Promise.resolve(snap.ownerUid==='teacherA'&&snap.revision===2?1:(()=>{throw new Error('changed')})()));
await env.cleanup();
const pass=R.filter(r=>r[1]).length;console.log(`RULES: ${pass}/${R.length} passed`);
process.exit(pass===R.length?0:1);
