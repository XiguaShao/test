import { Component ,Node, v3 ,_decorator, Prefab, instantiate} from "cc";
import ParNode from "./ParNode";
const {property, ccclass} = _decorator;
@ccclass('ParSystem')
export default class ParSystem extends Component {
    @property(Node)
    nodeTemp:Node = null;
    @property(Prefab)
    prefab: Prefab = null;
    // 生命周期
    nLife:number = 0;
    nLifeVar:number = 0;

    // 数量
    nMaxCnt:number = 0;

    // 初始xy
    nInitX:number = 0;
    nInitY:number = 0;
    nInitXVar:number = 0;
    nInitYVar:number = 0;

    // 初始角度
    nAngle:number = 0;
    nAngleVar:number = 0;

    // 整体的速度
    nSpeed:number = 1;

    // 旋转速度每秒
    nRotation:number = 0;
    nRotationVar:number = 0;

    // 重力加速度
    nGravity:number = 0;

    // x速度
    nVx:number = 0;
    nVxVar:number = 0;

    // y速度
    nVy:number = 0;
    nVyVar:number = 0;

    // 初始缩放
    nScale:number = -1;
    nScaleVar:number = 0;

    // 结束时的缩放 -1 不缩放
    nEndScale:number = -1;
    nEndScaleVar:number = 0;

    // 初始透明度
    nOpacity:number = -1;
    nOpacityVar:number = 0;

    // 结束时的透明度 -1 不改变
    nEndOpacity:number = -1;
    nEndOpacityVar:number = 0;

    // 一帧创建多少个
    private nCreateCnt:number = 10;

    private _arrParNode: ParNode[] = [];
    private _arrUsedParNode: ParNode[] = [];

    get template(){
        return this.nodeTemp || this.prefab;
    }

    protected onLoad(): void {
        this.nLife = 5;
        this.nLifeVar = 1;
        this.nGravity = 10;
        this.nOpacity = 255;
        this.nOpacityVar = 50;
        this.nScale = 3;
        this.nScaleVar = 1;
        this.nMaxCnt = 3;
        this.nInitX = 50;
        this.nInitXVar = 50;
        this.nInitY = 50;
        this.nInitYVar = 50;
        this.nVx = 0;
        this.nVxVar = 50;
        this.nVy = 0;
        this.nVyVar = 50;
        this.nRotation = 40;
        this.nRotationVar = 20;
        this.nEndScale = 6;
    }

    // 低刷新率
    bLowRefresh:boolean = true;
    private _nCnt:number = 0;
    private _nCurTime:number = 0;
    protected update(dt: number){
        dt *= this.nSpeed;
        this._nCurTime += dt;
        if(this.bLowRefresh){
            this._nCnt++;
            if(this._nCnt & 1) return;
            this._nCnt = 0
        }

        for(const com of this._arrUsedParNode) com.onUpdate(this._nCurTime);
        this._nCurTime = 0;

        for(let i = 0; i < this.nCreateCnt; i++){
            if(this._arrUsedParNode.length >= this.nMaxCnt) return;
            this._createParNode();
        }
    }

    private _createParNode(){
        if(this._arrUsedParNode.length >= this.nMaxCnt) return;
        this._initParNode(this._getParNode());
    }

    private _getParNode(): ParNode{
        if(this._arrParNode.length > 0) return this._arrParNode.pop();
        else{
            let node = instantiate(this.template) as Node;
            node.parent = this.node;
            return node.addComponent(ParNode);
        }
    }

    private _initParNode(com: ParNode){
        com.sys = this;
        com.node.active = true;
        com.nLife = this._getRandom(this.nLife, this.nLifeVar);
        (this.nOpacity != -1) && (com.opacity = this._getRandom(this.nOpacity, this.nOpacityVar));
        (this.nEndOpacity != -1) && (com.nEndOpacity = this._getRandom(this.nEndOpacity, this.nEndOpacityVar));
        if(this.nScale != -1){
            let nScale = this._getRandom(this.nScale, this.nScaleVar);
            com.node.setScale(v3(nScale, nScale, 1));
        }

        (this.nEndScale != -1) && (com.nEndScale = this._getRandom(this.nEndScale, this.nEndScaleVar));
        (this.nInitX || this.nInitY) && com.node.setPosition(this._getRandom(this.nInitX, this.nInitXVar), this._getRandom(this.nInitY, this.nInitYVar));

        this.nVx && (com.nSpeedX = this._getRandom(this.nVx, this.nVxVar));
        this.nVy && (com.nSpeedY = this._getRandom(this.nVy, this.nVyVar));
        this.nGravity && (com.nGravity = this.nGravity);
    }

    recycleParNode(com: ParNode){
        this._arrParNode.push(com);
        let index = this._arrUsedParNode.indexOf(com);
        if(index > -1) this._arrUsedParNode.splice(index, 1);
    }

    protected onDestroy(): void {
        for(const com of this._arrParNode) com.node.destroy();
        for(const com of this._arrUsedParNode) com.node.destroy();
        this._arrParNode.length = 0;
        this._arrUsedParNode.length = 0;
    }

    private _getRandom(nNum:number, nNumVar:number = 0): number{
        if(nNumVar == 0) return nNum;
        return nNum + ((Math.random()*2) - 1) * nNumVar;
    }

}