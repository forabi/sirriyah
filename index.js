// @flow

const str: number = 'hello world!';

interface Thing< T> {
  box: T;
}

const t: Thing<number> = {
  box: 'string',
};


console.log(str, t);
