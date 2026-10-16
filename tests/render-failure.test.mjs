import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../world.js';
import {reportRenderFailure} from '../render-diagnostics.js';

test('renderer diagnostics retain the original message and stack',t=>{
 t.mock.method(console,'error',()=>{});
 const error=new Error('A deliberately simulated rendering failure');
 const result=reportRenderFailure(error,'unit-test simulation');
 assert.equal(globalThis.__portfolioRenderError,result);
 assert.equal(result.message,error.message);
 assert.equal(result.stack,error.stack);
 assert.equal(result.phase,'unit-test simulation');
 delete globalThis.__portfolioRenderError;
});

test('unavailable WebGL selects the poster and reports the exact initialization error',async t=>{
 t.mock.method(console,'error',()=>{});
 const previousDocument=globalThis.document,classes=new Set();
 globalThis.document={body:{classList:{add:value=>classes.add(value)}},getElementById:()=>({classList:{remove:()=>{}}})};
 t.after(()=>{if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;delete globalThis.__portfolioRenderError;});
 // A stub canvas models a denied context; this is a unit test, not a browser test.
 const canvas={width:1920,height:1080,style:{},addEventListener(){},removeEventListener(){},setAttribute(){},getContext:()=>null};
 const world=new World(canvas);
 await world.ready;
 assert.equal(world.available,false);
 assert.ok(classes.has('no-gpu'));
 assert.equal(world.error.phase,'initialization');
 assert.equal(world.error.message,'Error creating WebGL context.');
 assert.equal(globalThis.__portfolioRenderError,world.error);
});
