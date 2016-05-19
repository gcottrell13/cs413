
function stackhelper()
{
	
	var stack = [];
	var top = 0; // the space above the last thing on the stack
	
	this.pop = function()
	{
		if(top > 0)
			top --;
	};
	this.push = function(o)
	{
		stack[top] = o;
		top ++;
	};
	
	this.get_top = function()
	{
		if(top > 0)
			return stack[top - 1];
		return null;
	};
	
}





