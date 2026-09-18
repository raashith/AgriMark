import Link from 'next/link';
import { ArrowLeft, Leaf } from 'lucide-react';
export default function NotFound(){return <div className="login-page"><div className="login-card" style={{textAlign:'center'}}><div className="logo" style={{margin:'0 auto'}}><Leaf/></div><h2 style={{marginTop:16}}>That AgriMark page is not available.</h2><p style={{color:'#707873',lineHeight:1.7}}>Use the navigation to return to a supported Stitch experience.</p><Link href="/" className="btn btn-primary" style={{marginTop:15}}><ArrowLeft size={16}/> Return home</Link></div></div>}
