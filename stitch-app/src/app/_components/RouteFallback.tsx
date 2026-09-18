'use client';
import Link from 'next/link';
import { ArrowLeft, Leaf } from 'lucide-react';
export default function RouteFallback({title='AgriMark workspace'}:{title?:string}){return <div className="login-page"><div className="login-card" style={{textAlign:'center'}}><div className="logo" style={{margin:'0 auto'}}><Leaf/></div><h2 style={{marginTop:16}}>{title}</h2><p style={{color:'#707873',lineHeight:1.65}}>This Stitch surface is wired into the shared AgriMark application shell. The production workflow remains available through the canonical web experience.</p><Link href="/" className="btn btn-primary" style={{marginTop:15}}><ArrowLeft size={16}/> Return home</Link></div></div>}
