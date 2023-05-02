//
//  NativeModule.m
//  Rawcaster
//
//  Created by Senthilkumar Periyasamy on 29/04/23.
//
#import "NativeModule.h"
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>

@implementation NativeModule




RCT_EXPORT_MODULE(CalendarModule);

RCT_EXPORT_METHOD(createCalendarEvent:(NSString *)name location:(NSString *)location)
{
 RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
}
@end
