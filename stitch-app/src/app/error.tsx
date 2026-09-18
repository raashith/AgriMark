'use client';
import { useEffect } from 'react';
import Link from 'next/link';
export default function Error({error,reset}:{error:Error & {digest?:string};reset:()=>void}){useEffect(()=>{console.error(error)},[error]);return <div className="login-page"><div className="login-card" style={{textAlign:'center'}}><h2>AgriMark hit a temporary problem.</h2><p style={{color:'#707873',lineHeight:1.7}}>Your data is not being changed by this screen. Try the page again or return to the landing experience.</p><div className="cta-row" style={{justifyContent:'center'}}><button className="btn btn-primary" onClick={()=>reset()}>Try again</button><Link className="btn btn-secondary" href="/">Home</Link></div></div></div>}
