import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class PCFGitAvatar implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _notifyOutputChanged: ()=> void;
	private _textbox: HTMLInputElement;
	private _image:HTMLImageElement;
	private _value:string;
	private _textboxOnChange:EventListenerOrEventListenerObject;

	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code
		this._notifyOutputChanged = notifyOutputChanged;
		this._textboxOnChange = this.textboxOnChange.bind(this);

		let username = context.parameters.gitUsername.raw || "";
		let shape = context.parameters.imageShape.raw;

		let textbox = document.createElement("input");
		textbox.addEventListener('input',this._textboxOnChange);
		textbox.value= username;
		this._textbox = textbox;

		let image = document.createElement("img");
		if(shape == "Circle") {image.classList.add("circle");}
		this.SetAvatarImage(image,username);
		this._image = image;

		container.appendChild(textbox);
		container.appendChild(image)
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		this._textbox.disabled = context.mode.isControlDisabled;
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {gitUsername: this._value};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		this._textbox.removeEventListener('input',this._textboxOnChange);
	}

	private async SetAvatarImage (ImageContainer:HTMLImageElement, username:string){
		const response = await fetch("https://api.github.com/users/"+username);
		const body = await response.json();
		ImageContainer.src = body.avatar_url;
	}

	public textboxOnChange():void{
		this._value = this._textbox.value|| "";
		this.SetAvatarImage(this._image, this._value);
		this._notifyOutputChanged();
	}
}