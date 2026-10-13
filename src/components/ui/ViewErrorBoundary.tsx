import "./recovery.css";
import { Component, type ReactNode } from "react";
export class ViewErrorBoundary extends Component<{children:ReactNode;resetKey:string;onHome:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidUpdate(previous:Readonly<{resetKey:string}>){if(previous.resetKey!==this.props.resetKey&&this.state.failed)this.setState({failed:false});}
  render(){return this.state.failed?<main className="kp-view-recovery" role="alert"><h1>This view could not be displayed</h1><p>Your mounted Lab session records are retained. Try this view again or return Home.</p><button type="button" onClick={()=>this.setState({failed:false})}>Try again</button><button type="button" onClick={()=>{this.setState({failed:false});this.props.onHome();}}>Back to Home</button></main>:this.props.children;}
}
