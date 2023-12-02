// Based on https://github.com/discord/focus-layers since the project seems unmaintained.
// It's React only but lighter and work better than the focus-trap module https://github.com/focus-trap/focus-trap.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type React from 'react';

function createFocusWalker(root: HTMLElement) {
  return document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: HTMLElement) => {
      // `.tabIndex` is not the same as the `tabindex` attribute. It works on the
      // runtime's understanding of tabbability, so this automatically accounts
      // for any kind of element that could be tabbed to.
      // @ts-ignore We skip elements that have a disabled property.
      return node.tabIndex >= 0 && !node.disabled ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
}

/**
 * Given a `root` container element and a `target` that is outside of that
 * container and intended to receive focus, force the DOM focus to wrap around
 * such that it remains within `root`.
 *
 * If `forceFirst` is set to `true`, the wrap will always attempt to focus the
 * first viable element in `root`, rather than wrapping to the end.
 */
function wrapFocus(root: HTMLElement, target: Element, forceFirst: boolean = false) {
  const walker = createFocusWalker(root);
  const position = target.compareDocumentPosition(root);
  let wrappedTarget: HTMLElement | null = null;

  if (position & Node.DOCUMENT_POSITION_PRECEDING || forceFirst) {
    wrappedTarget = walker.firstChild() as HTMLElement | null;
  } else if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    wrappedTarget = walker.lastChild() as HTMLElement | null;
  }

  const newFocus = wrappedTarget ? wrappedTarget : root;
  newFocus.focus();
}

/**
 * Structural representation of a lock layer.
 */
type Lock = {
  /**
   * Friendly id for the lock. Must be unique at least across all active locks.
   */
  uid: string;
  /**
   * Representation of the current state of the lock. Only gets updated _after_
   * enable callbacks have been run.
   */
  enabled: boolean;
  /**
   * Callback for actually enabling/disabling the locking logic in the consumer.
   * This function _must_ immediately cause the logic to be enabled/disabled.
   * Using asynchronous logic can cause issues where two mutually-exclusive locks
   * may be active at the same time, causing an infinite loop of focus movement.
   */
  setEnabled: (enabled: boolean) => unknown;
};

/**
 * A callback meant to be invoked whenever the state of a lock stack changes.
 * The first argument, `enabled`, indicates the enabled state of the top lock
 * in the stack, and the second argument, `stack`, is a reference to that
 * stack itself.
 */
type LockListener = (enabled: boolean, stack: Lock[]) => unknown;

/**
 * Simple stack-like structure representing a layer system for focus locks.
 *
 * The stack takes care of enabling and disabling layers as necessary when locks
 * are added or removed from the stack. In this way, it is guaranteed that only
 * the top lock in the stack will be enabled at any given time.
 *
 * The stack also provides a subscription interface for consumers to be notified
 * whenever the state of the stack changes.
 */
class LockStack {
  /**
   * The stack of currently-active locks. At any given time, only the lock at
   * the top of the stack should be enabled. Locks in the rest of the stack will
   * be re-enabled when all locks above it are removed.
   */
  private locks: Lock[] = [];
  /**
   * List of listeners that will be notified whenever the state of the lock tree
   * is updated.
   */
  private listeners: LockListener[] = [];

  /**
   * Push a new lock layer onto the top of the stack. This will cause the layer
   * below to be disabled before this lock's callback is enabled.
   * Locks should not enable themselves until the callback has been invoked to
   * ensure that other locks are not also concurrently active.
   */
  add(uid: Lock['uid'], setEnabled: Lock['setEnabled']) {
    const newLock: Lock = { uid, setEnabled, enabled: false };
    this.toggleLayer(this.current(), false);
    this.locks.push(newLock);
    this.toggleLayer(newLock, true);
    this.emit();
  }

  /**
   * Immediately remove the lock with the given id from the stack. This will
   * call the lock's callback to disable it before removing. Then if it was the
   * currently-active lock, the new current lock will be re-enabled.
   */
  remove(uid: string) {
    const lock = this.locks.find((lock) => lock.uid === uid);
    this.toggleLayer(lock, false);

    const current = this.current();
    const wasCurrent = current && current.uid === uid;
    this.locks = this.locks.filter((lock) => lock.uid !== uid);

    if (wasCurrent) {
      this.toggleLayer(this.current(), true);
    }
    this.emit();
  }

  /**
   * Returns the lock that currently lives at the top of the stack.
   */
  current() {
    return this.locks[this.locks.length - 1];
  }

  /**
   * Returns the enabled state of the currently-active lock.
   */
  isActive() {
    const current = this.current();
    return current ? current.enabled : false;
  }

  /**
   * Utility for enabling and disabling layers atomically.
   */
  toggleLayer(lock: Lock | undefined, enabled: boolean) {
    if (!lock) {
      return;
    }

    lock.setEnabled(enabled);
    lock.enabled = enabled;
  }

  /**
   * Adds a listener that will be invoked whenever the state of the lock stack
   * changes. Callbacks are called with the "enabled" state of the current lock,
   * and the stack itself as a reference.
   *
   * Returns a function to unsubscribe the listener from the stack.
   */
  subscribe(callback: LockListener): () => void {
    this.listeners.push(callback);
    callback(this.isActive(), this.locks);

    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
      return this.listeners;
    };
  }

  /**
   * Updates all currently-subscribed listeners with the current state of the
   * lock stack.
   */
  emit() {
    const active = this.isActive();
    this.listeners.forEach((listener) => {
      return listener(active, this.locks);
    });
  }
}

// This global ensures that only one stack exists in the document. Having multiple
// active stacks does not make sense, as documents are only capable of having one
// activeElement at a time.
const LOCK_STACK = new LockStack();

let lockCount = 0;
function newLockUID() {
  return `lock-${lockCount++}`;
}

/**
 * Creates a subscription to the lock stack that is bound to the lifetime
 * of the caller, based on `useEffect`.
 */
export function useLockSubscription(callback: LockListener) {
  // `subscribe` returns an `unsubscribe` function that `useEffect` can invoke
  // to clean up the subscription.
  useEffect(() => {
    LOCK_STACK.subscribe(callback);
  }, [callback]);
}

/**
 * Set up a return of focus to the target element specified by `returnTo` to
 * occur at the end of the lifetime of the caller component. In other words,
 * return focus to where it was before the caller component was mounted.
 */
export function useFocusReturn(returnRef?: React.RefObject<HTMLElement>, disabledRef?: React.RefObject<boolean>) {
  // This isn't necessarily safe, but realistically it's sufficient.
  const [target] = useState(() => document.activeElement as HTMLElement);

  useLayoutEffect(() => {
    const isDisabled = disabledRef?.current;
    const returnElement = returnRef?.current;

    return () => {
      if (isDisabled) {
        return;
      }

      // Happens on next tick to ensure it is not overwritten by focus lock.
      if (returnElement) {
        returnElement.focus();
        return;
      }
      target?.focus();
    };
    // Explicitly only want this to run on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Create and push a new lock onto the global LOCK_STACK, tied to the lifetime
 * of the caller. Returns a ref containing the current enabled state of the
 * layer, to be used for enabling/disabling the caller's lock logic.
 */
export function useLockLayer(controlledUID?: string) {
  const [uid] = useState(() => controlledUID || newLockUID());
  const enabledRef = useRef(false);
  // When first created, immediately disable the current layer (the one below
  // this new one) to prevent its handlers from stealing focus back when this
  // layer mounts. Specifically, this allows `autoFocus` to work, since React
  // will perform the autofocus before any effects have run.
  const [,] = useState(() => LOCK_STACK.toggleLayer(LOCK_STACK.current(), false));

  useLayoutEffect(() => {
    LOCK_STACK.add(uid, (enabled) => (enabledRef.current = enabled));

    return () => {
      LOCK_STACK.remove(uid);
    };
  }, [uid]);

  return enabledRef;
}

export type FocusLockOptions = {
  returnRef?: React.RefObject<HTMLElement>;
  disableReturnRef?: React.RefObject<boolean>;
  attachToRef?: React.RefObject<HTMLElement | Document>;
  disable?: boolean;
};

export function useFocusLock(containerRef: React.RefObject<HTMLElement>, options: FocusLockOptions = {}) {
  const { returnRef, disableReturnRef, attachToRef = containerRef, disable } = options;
  // Create a new layer for this lock to occupy
  const enabledRef = useLockLayer();

  // Allow the caller to override the lock and force it to be disabled.
  useEffect(() => {
    if (!disable) {
      return;
    }

    enabledRef.current = false;
  }, [disable, enabledRef]);

  // Apply the actual lock logic to the container.
  useLayoutEffect(() => {
    // Move focus into the container if it is not already, or if an element
    // inside of the container will automatically receive focus, it won't be moved.
    const container = containerRef.current;
    if (
      container &&
      document.activeElement &&
      !container.contains(document.activeElement) &&
      container.querySelector('[autofocus]')
    ) {
      wrapFocus(container, document.activeElement, true);
    }

    function handleFocusIn(event: FocusEvent) {
      if (!enabledRef.current) {
        return;
      }

      const root = containerRef.current;
      if (!root) {
        return;
      }

      const newFocusElement = (event.target as Element | null) || document.body;
      if (root.contains(newFocusElement)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      wrapFocus(root, newFocusElement);
    }

    function handleFocusOut(event: FocusEvent) {
      if (!enabledRef.current) {
        return;
      }

      const root = containerRef.current;
      if (!root) {
        return;
      }

      const newFocusElement = (event.relatedTarget as Element | null) || document.activeElement || document.body;
      if (event.relatedTarget === document.body) {
        event.preventDefault();
        root.focus();
      }

      if (root.contains(newFocusElement)) {
        return;
      }

      wrapFocus(root, newFocusElement);
    }

    const attachTo = attachToRef.current;
    if (!attachTo) {
      return;
    }

    attachTo.addEventListener('focusin', handleFocusIn as EventListener, { capture: true });
    attachTo.addEventListener('focusout', handleFocusOut as EventListener, { capture: true });
    return () => {
      attachTo.removeEventListener('focusin', handleFocusIn as EventListener, { capture: true });
      attachTo.removeEventListener('focusout', handleFocusOut as EventListener, { capture: true });
    };
  }, [containerRef, attachToRef, enabledRef]);

  // Set up a focus return after the container is unmounted.
  // This happens at the end to absolutely ensure that the return is the last
  // thing that will run as part of this hook (i.e., that the focus handlers
  // have been fully detached).
  useFocusReturn(returnRef, disableReturnRef);
}
