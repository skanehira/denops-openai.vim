# denops-template.vim
Plugin for [OpenAI](https://openai.com).  
This plugin is WIP, Interfaces are subject to change.

![](https://i.gyazo.com/f0a43bb7a0589644f9590615a8ad117f.gif)

## Usage
At first, please get your OpenAI api key.  
And then, please add config variable.

e.g: init.lua
```lua
vim.g['openai_config'] = { apiKey = 'your api key' };
```

Ok, this is the end of the setup.  
Next, you can execute this command to open buffer and feel free to write some things.

```vim
:OpenaiChat
```

At the end, `:write` will post message to openai and you'll recieve response.

## Author
skanehira
