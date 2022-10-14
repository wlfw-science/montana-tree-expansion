import {  AnimationTriggerMetadata, trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const rollUpDown: AnimationTriggerMetadata = trigger('rollUpDown', [
      state('up', style({height: '0px'})),
      state('down', style({height: '*'})),
      transition(':enter', [
        style({height: 0, overflow: 'hidden'}),
        animate(300, style({height: '*' }))
      ]),
      transition(':leave', [
        style({height: '*', display: 'block', overflow: 'hidden'}),
        animate(300, style({height: 0}))
      ])
    ]);

export const expandWidth: AnimationTriggerMetadata = trigger('expandWidth', [
      transition(':enter', [
        style({width: '0px', overflow: 'hidden'}),
        animate(500, style({width: '*' }))
      ]),
      transition(':leave', [
        // style({width: '*', overflow: 'hidden'}),
        animate(500, style({width: '0px'}))
      ])
]);

export const flyInOut: AnimationTriggerMetadata =
  trigger('flyInOut', [
    state('out', style({width: '0px'})),
    state('in', style({width: '*'})),
    transition(':enter', [
      style({width: '0px'}),
      animate(700, style({width: '*'}))
    ]),
    transition(':leave', [
      style({width: '*'}),
      animate(700, style({ width: '0px'}))
    ])
  ]);

export const fadeInOut: AnimationTriggerMetadata =
  trigger('fadeInOut', [
    state('out', style({opacity: 0})),
    state('in', style({opacity: 1})),
    transition(':enter', [
      style({opacity: 0}),
      animate(400, style({opacity: '*'}))
    ]),
    transition(':leave', [
      style({opacity: '*'}),
      animate(400, style({ opacity: 0}))
    ])
  ]);


export const spinInOut: AnimationTriggerMetadata =
  trigger('spinInOut', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate(400, style({ opacity: 1, transform: '*'}))
    ]),
    transition(':leave', [
      style({ transform: '*'}),
      animate(400, style({ opacity: 0, transform: 'rotate(0.5turn)'}))
    ])
  ]);
