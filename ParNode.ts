import { Component, UIOpacity, Vec3, v3 , _decorator} from "cc";
import ParSystem from "./ParSystem";
const {property, ccclass} = _decorator;
@ccclass('ParNode')
export default class ParNode extends Component{
    private _sys: ParSystem = null;
    set sys(sys){
        this._sys = sys;
    }
    private _nCurLife:number = 0;

    // 生命周期一定要先设置
    private _nLife:number = 0;
    set nLife(nLife:number){
        this._nLife = nLife;
    }

    private _op: UIOpacity = null;
    get op(): UIOpacity{
        return this._op || (this._op = this.node.getComponent(UIOpacity)) || (this._op = this.node.addComponent(UIOpacity));
    }

    set opacity(op: number){
        this.op.opacity = op;
    }

    private _nOpaSec:number = 0;
    set nEndOpacity(nEndOpacity:number){
        this._nOpaSec = (this.op.opacity - nEndOpacity) / this._nLife;
    }

    private _nScaleSec:number = 0;
    set nEndScale(nEndScale:number){
        this._nScaleSec = (this.node.scale.x - nEndScale) / this._nLife;
    }

    private _nGravity:number = 0;
    set nGravity(nGravity:number){
        this._nGravity = nGravity;
    }

    private _nAngleSec:number = 0;
    set nAngelSec(nAngelSec:number){
        this._nAngleSec = nAngelSec;
    }

    private _nSpeedX:number = 0;
    set nSpeedX(nSpeedX:number){
        this._nSpeedX = nSpeedX;
    }

    private _nSpeedY:number = 0;
    set nSpeedY(nSpeedX:number){
        this._nSpeedY = nSpeedX;
    }

    set scale(num:number){
        this.node.setScale(v3(num, num, 1));
    }

    onUpdate(nDelt: number){
        this._nCurLife += nDelt;
        if(this._nCurLife >= this._nLife) return this.onDie();

        // 透明度
        this._nOpaSec && (this.op.opacity -= this._nOpaSec * nDelt);
        // 缩放

        this._nScaleSec && (this.scale = this.node.scale.x - this._nScaleSec * nDelt);
        this._nAngleSec && (this.node.angle += this._nAngleSec * nDelt);

        // 重力
        this._nGravity && (this.node.setPosition(this.node.position.x, this.node.position.y - ((this._nGravity * this._nCurLife * this._nCurLife)*0.5), this.node.position.z));
        (this._nSpeedX || this._nSpeedY) && this.node.setPosition(this.node.position.x + this._nSpeedX * nDelt, this.node.position.y + this._nSpeedY * nDelt, 0);
    }

    clear(){
        this._nCurLife = 0;
        this._nLife = 0;
        this.node.setPosition(v3(0, 0, 0));
        this.op.opacity = 255;
        this.node.angle = 0;
        this.node.setScale(v3(1, 1, 1));
        this._nOpaSec = 0;
        this._nAngleSec = 0;
        this._nSpeedX = 0;
        this._nSpeedY = 0;
        this._nScaleSec = 0;
        this._nGravity = 0;
    }

    onDie(){
        this.node.active = false;
        this.clear();
        this._sys.recycleParNode(this);
    }
}